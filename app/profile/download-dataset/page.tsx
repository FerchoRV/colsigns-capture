"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ref,
    listAll,
    getDownloadURL,
    getMetadata,
    StorageReference,
} from "firebase/storage";
import JSZip from "jszip";
import {
    FolderIcon,
    HomeIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    PlayCircleIcon,
    DocumentIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import ProtectedRoute from "../../components/ProtectedRoute";
import { storage } from "@/firebase/firebaseConfig";

interface FolderEntry {
    name: string;
    fullPath: string;
}

interface FileEntry {
    name: string;
    fullPath: string;
    sizeBytes?: number;
    contentType?: string;
}

const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return "—";
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const isVideoFile = (file: FileEntry) => {
    if (file.contentType && file.contentType.startsWith("video/")) return true;
    return /\.(mp4|webm|mov|avi|mkv|m4v|ogg)$/i.test(file.name);
};

export default function DownloadDatasetPage() {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [folders, setFolders] = useState<FolderEntry[]>([]);
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

    const [isZipping, setIsZipping] = useState<boolean>(false);
    const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null);

    const breadcrumbs = useMemo(() => {
        if (!currentPath) return [] as { name: string; path: string }[];
        const parts = currentPath.split("/").filter(Boolean);
        const acc: { name: string; path: string }[] = [];
        let pathAcc = "";
        for (const part of parts) {
            pathAcc = pathAcc ? `${pathAcc}/${part}` : part;
            acc.push({ name: part, path: pathAcc });
        }
        return acc;
    }, [currentPath]);

    const loadCurrentPath = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const folderRef = ref(storage, currentPath || "/");
            const result = await listAll(folderRef);

            const folderEntries: FolderEntry[] = result.prefixes
                .map((p) => ({ name: p.name, fullPath: p.fullPath }))
                .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

            const fileEntriesRaw: FileEntry[] = await Promise.all(
                result.items.map(async (itemRef) => {
                    try {
                        const meta = await getMetadata(itemRef);
                        return {
                            name: itemRef.name,
                            fullPath: itemRef.fullPath,
                            sizeBytes: meta.size,
                            contentType: meta.contentType,
                        } as FileEntry;
                    } catch {
                        return {
                            name: itemRef.name,
                            fullPath: itemRef.fullPath,
                        } as FileEntry;
                    }
                }),
            );

            const fileEntries = fileEntriesRaw.sort((a, b) =>
                a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
            );

            setFolders(folderEntries);
            setFiles(fileEntries);
        } catch (error) {
            console.error("Error listando el storage:", error);
            setErrorMessage(
                "Error al obtener el contenido del almacenamiento. Verifica tus permisos e intenta de nuevo.",
            );
            setFolders([]);
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPath]);

    useEffect(() => {
        loadCurrentPath();
    }, [loadCurrentPath]);

    const handleEnterFolder = (folder: FolderEntry) => {
        setCurrentPath(folder.fullPath);
    };

    const handleBreadcrumbClick = (path: string) => {
        setCurrentPath(path);
    };

    const handleGoHome = () => {
        setCurrentPath("");
    };

    const handleOpenPreview = async (file: FileEntry) => {
        setPreviewFile(file);
        setPreviewUrl(null);
        setIsLoadingPreview(true);
        try {
            const fileRef = ref(storage, file.fullPath);
            const url = await getDownloadURL(fileRef);
            setPreviewUrl(url);
        } catch (error) {
            console.error("Error obteniendo URL del video:", error);
            setErrorMessage("No se pudo cargar la vista previa del video.");
            setPreviewFile(null);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleClosePreview = () => {
        setPreviewFile(null);
        setPreviewUrl(null);
    };

    // Recolecta todos los archivos contenidos dentro de una referencia, recursivamente.
    const collectAllFiles = useCallback(
        async (folderRef: StorageReference): Promise<StorageReference[]> => {
            const result = await listAll(folderRef);
            const nestedLists = await Promise.all(result.prefixes.map((p) => collectAllFiles(p)));
            return [...result.items, ...nestedLists.flat()];
        },
        [],
    );

    const downloadFileBlob = async (fileRef: StorageReference, maxAttempts = 3): Promise<Blob> => {
        let lastError: unknown;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                const url = await getDownloadURL(fileRef);
                const proxyUrl = `/api/storage-file?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} al descargar ${fileRef.fullPath}`);
                }

                return await response.blob();
            } catch (error) {
                lastError = error;

                if (attempt < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
                }
            }
        }

        throw lastError;
    };

    const handleDownloadAll = async () => {
        if (isZipping) return;

        setErrorMessage(null);
        setIsZipping(true);
        setZipProgress({ current: 0, total: 0 });

        try {
            const folderName = currentPath
                ? currentPath.split("/").filter(Boolean).pop() || "dataset"
                : "dataset";

            const folderRef = ref(storage, currentPath || "/");
            const allFiles = await collectAllFiles(folderRef);

            if (allFiles.length === 0) {
                setErrorMessage("No hay archivos para descargar en esta carpeta.");
                return;
            }

            setZipProgress({ current: 0, total: allFiles.length });

            const zip = new JSZip();
            const basePath = currentPath ? `${currentPath}/` : "";

            let completed = 0;
            let addedFiles = 0;
            const failedFiles: string[] = [];

            for (const fileRef of allFiles) {
                try {
                    const blob = await downloadFileBlob(fileRef);
                    const relativePath = fileRef.fullPath.startsWith(basePath)
                        ? fileRef.fullPath.slice(basePath.length)
                        : fileRef.name;
                    zip.file(relativePath, blob);
                    addedFiles += 1;
                } catch (error) {
                    console.error(`Error descargando ${fileRef.fullPath}:`, error);
                    failedFiles.push(fileRef.fullPath);
                }
                completed += 1;
                setZipProgress({ current: completed, total: allFiles.length });
            }

            if (addedFiles === 0) {
                throw new Error("No se pudo descargar ningún archivo para generar el ZIP.");
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${folderName}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            if (failedFiles.length > 0) {
                setErrorMessage(
                    `El ZIP se generó, pero ${failedFiles.length} archivo(s) no se pudieron incluir. Revisa la consola para ver cuáles fallaron.`,
                );
            }
        } catch (error) {
            console.error("Error generando el ZIP:", error);
            setErrorMessage("Error al generar el archivo ZIP. Intenta de nuevo.");
        } finally {
            setIsZipping(false);
            setZipProgress(null);
        }
    };

    return (
        <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)]}>
            <main className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
                        Descargar Dataset
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Explora las carpetas del almacenamiento y descarga el contenido de cada
                        seña en formato ZIP.
                    </p>
                </div>

                {/* Breadcrumbs */}
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center flex-wrap gap-1 text-sm bg-white border border-gray-200 rounded-md px-3 py-2 mb-4 shadow-sm"
                >
                    <button
                        type="button"
                        onClick={handleGoHome}
                        className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors ${
                            currentPath === "" ? "text-blue-600 font-semibold" : "text-gray-700"
                        }`}
                    >
                        <HomeIcon className="w-4 h-4" />
                        Inicio
                    </button>
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb.path}>
                            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => handleBreadcrumbClick(crumb.path)}
                                className={`px-2 py-1 rounded hover:bg-blue-50 transition-colors ${
                                    idx === breadcrumbs.length - 1
                                        ? "text-blue-600 font-semibold"
                                        : "text-gray-700"
                                }`}
                            >
                                {crumb.name}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>

                {/* Acciones */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <button
                        type="button"
                        onClick={loadCurrentPath}
                        disabled={isLoading || isZipping}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Actualizar
                    </button>

                    {currentPath !== "" && (
                        <button
                            type="button"
                            onClick={handleDownloadAll}
                            disabled={isZipping || isLoading || (files.length === 0 && folders.length === 0)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            {isZipping
                                ? zipProgress
                                    ? `Comprimiendo ${zipProgress.current}/${zipProgress.total}...`
                                    : "Preparando ZIP..."
                                : "Descargar todo"}
                        </button>
                    )}
                </div>

                {/* Mensajes */}
                {errorMessage && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {errorMessage}
                    </div>
                )}

                {isZipping && zipProgress && zipProgress.total > 0 && (
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-blue-600 h-full transition-all"
                                style={{
                                    width: `${(zipProgress.current / zipProgress.total) * 100}%`,
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Descargando {zipProgress.current} de {zipProgress.total} archivos...
                        </p>
                    </div>
                )}

                {/* Contenido */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                        Cargando contenido...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Carpetas */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                Carpetas{" "}
                                <span className="text-sm font-normal text-gray-500">
                                    ({folders.length})
                                </span>
                            </h2>
                            {folders.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                    No hay carpetas en esta ubicación.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {folders.map((folder) => (
                                        <button
                                            key={folder.fullPath}
                                            type="button"
                                            onClick={() => handleEnterFolder(folder)}
                                            className="group flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md hover:bg-blue-50 transition-all text-center"
                                            title={folder.fullPath}
                                        >
                                            <FolderIcon className="w-10 h-10 text-blue-500 group-hover:text-blue-600" />
                                            <span className="text-sm font-medium text-gray-800 break-all line-clamp-2">
                                                {folder.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Archivos */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                Archivos{" "}
                                <span className="text-sm font-normal text-gray-500">
                                    ({files.length})
                                </span>
                            </h2>
                            {files.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                    No hay archivos en esta carpeta.
                                </p>
                            ) : (
                                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Nombre</th>
                                                <th className="px-4 py-3 text-left hidden md:table-cell">
                                                    Tipo
                                                </th>
                                                <th className="px-4 py-3 text-right">Tamaño</th>
                                                <th className="px-4 py-3 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {files.map((file) => {
                                                const video = isVideoFile(file);
                                                return (
                                                    <tr
                                                        key={file.fullPath}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                {video ? (
                                                                    <PlayCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                                ) : (
                                                                    <DocumentIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                                )}
                                                                <span className="text-gray-800 break-all">
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                                            {file.contentType || "—"}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">
                                                            {formatBytes(file.sizeBytes)}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {video && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenPreview(file)
                                                                    }
                                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                                >
                                                                    Ver
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* Modal de previsualización */}
                {previewFile && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
                        onClick={handleClosePreview}
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl max-w-3xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800 break-all pr-4">
                                    {previewFile.name}
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleClosePreview}
                                    className="text-gray-500 hover:text-gray-700"
                                    aria-label="Cerrar"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-4">
                                {isLoadingPreview ? (
                                    <div className="flex items-center justify-center h-64 text-gray-500">
                                        <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                                        Cargando video...
                                    </div>
                                ) : previewUrl ? (
                                    <video
                                        src={previewUrl}
                                        controls
                                        autoPlay
                                        className="w-full max-h-[70vh] bg-black rounded"
                                    />
                                ) : (
                                    <p className="text-center text-gray-500 py-10">
                                        No se pudo cargar la vista previa.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}
