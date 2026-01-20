"use client";

import { CurrencyDollarIcon, UsersIcon } from "@heroicons/react/20/solid";

interface CourseCardProps {
  name: string;
  description: string;
  price: number; // En la blockchain solemos manejarlo como string o bigint
  isActive: boolean;
  studentCount: number;
  onEnroll?: () => void;
  isOwner?: boolean;
  alreadyHasAccess?: boolean;
}

export function CourseCard({
  name,
  description,
  price,
  isActive,
  studentCount,
  onEnroll,
  isOwner,
  alreadyHasAccess,
}: CourseCardProps) {
  // Lógica de texto del botón basada en los nuevos requisitos
  const getButtonText = () => {
    if (isOwner) return "Modo Admin";
    if (alreadyHasAccess) return "Ya inscrito";
    return isActive ? "Inscribirse" : "No disponible";
  };

  const isButtonDisabled = !isActive || isOwner || alreadyHasAccess;

  return (
    <div className="card w-full bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
      <div className="card-body">
        {/* Badge de Estado */}
        <div className="flex justify-between items-start">
          <h2 className="card-title text-xl font-bold">{name}</h2>
          <div className={`badge ${isActive ? "badge-success" : "badge-ghost"} gap-2`}>
            {isActive ? "Activo" : "Inactivo"}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-base-content/70 line-clamp-3 my-2">{description}</p>

        {/* Info de Precio y Estudiantes */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-primary" />
            <span className="text-2xl font-black">{price} ETH</span>
          </div>

          <div className="flex items-center gap-2 text-base-content/60">
            <UsersIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {studentCount} {studentCount === 1 ? "estudiante" : "estudiantes"}
            </span>
          </div>
        </div>

        {/* Acción */}
        <div className="card-actions justify-end mt-6">
          <button
            onClick={onEnroll}
            disabled={isButtonDisabled}
            className={`btn btn-primary w-full ${alreadyHasAccess ? "btn-outline btn-success" : ""}`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
