// app/ui/evaluate/labels-colsign-45-154.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";

const LABELS_URL = "/info_models/colsign_lstm_norm_45_154_labels.json";
const PAGE_SIZE = 25;

interface LabelsColsign45154Props {
  onLetterSelect: (label: string, signType?: string) => void;
  selectedLetter?: string | null;
  signType?: string;
}

export default function LabelsColsign45154({
  onLetterSelect,
  selectedLetter,
  signType,
}: LabelsColsign45154Props) {
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    const fetchLabels = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch(LABELS_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`No se pudo cargar el archivo (${response.status}).`);
        }

        const data = await response.json();
        const idToName: Record<string, string> = data?.id_to_name ?? {};

        // Ordena por id numérico para mantener un orden estable.
        const sortedLabels = Object.entries(idToName)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, name]) => name);

        if (isMounted) {
          setLabels(sortedLabels);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Error desconocido al cargar las etiquetas."
          );
          setLabels([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLabels();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(labels.length / PAGE_SIZE)),
    [labels.length]
  );

  // Si cambia el total de páginas (p. ej. tras la carga), asegura una página válida.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedLabels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return labels.slice(start, start + PAGE_SIZE);
  }, [labels, currentPage]);

  // Si la etiqueta seleccionada está en otra página, navega a esa página automáticamente.
  useEffect(() => {
    if (!selectedLetter || labels.length === 0) return;
    const index = labels.indexOf(selectedLetter);
    if (index === -1) return;
    const targetPage = Math.floor(index / PAGE_SIZE) + 1;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
    // Solo reaccionamos al cambio de selección o de la lista cargada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLetter, labels]);

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(safePage);
  };

  // Genera una ventana de páginas con elipsis para que la barra no crezca demasiado.
  const pageNumbers = useMemo<(number | "...")[]>(() => {
    const windowSize = 5;
    if (totalPages <= windowSize + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    const half = Math.floor(windowSize / 2);
    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage - half < 2) {
      end = Math.min(totalPages - 1, end + (2 - (currentPage - half)));
    }
    if (currentPage + half > totalPages - 1) {
      start = Math.max(2, start - (currentPage + half - (totalPages - 1)));
    }

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="p-5 text-gray-600">Cargando etiquetas del modelo...</div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-5 text-red-600">
        Error al cargar las etiquetas: {errorMessage}
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="p-5 text-gray-600">
        No se encontraron etiquetas en el modelo.
      </div>
    );
  }

  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, labels.length);

  return (
    <div className="flex flex-col">
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          gap-3 p-5
        "
      >
        {paginatedLabels.map((label) => (
          <button
            key={label}
            type="button"
            title={label}
            className={`
              px-3 py-2 min-h-10 flex items-center justify-center
              text-sm font-semibold text-white rounded-md cursor-pointer
              shadow-md text-center break-words
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
              ${
                selectedLetter === label
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
              }
            `}
            onClick={() => onLetterSelect(label, signType)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 pb-5">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-semibold">{startIdx}</span>–
          <span className="font-semibold">{endIdx}</span> de{" "}
          <span className="font-semibold">{labels.length}</span> etiquetas
        </p>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-sm text-gray-500 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
