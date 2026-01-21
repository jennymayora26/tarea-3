"use client";

import { useMemo } from "react";
import { Address } from "@scaffold-ui/components";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { parseEther } from "viem";
import { CurrencyDollarIcon, EyeIcon, UsersIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CourseCardProps {
  courseId: string;
  name: string;
  description: string;
  price: string; // Recibimos el string de ETH sin redondear desde el Home
  isActive: boolean;
  studentCount: number;
  isOwner: boolean;
  userAddress: string;
}

export function CourseCard({
  courseId,
  name,
  description,
  price: priceInEth,
  isActive,
  studentCount,
  isOwner,
  userAddress,
}: CourseCardProps) {
  // 1. Hook para el precio de mercado de ETH
  const ethPriceInUsd = useFetchNativeCurrencyPrice();

  // 2. Hook para comprar el curso
  const { writeContractAsync: writeCourseManagementAsync } = useScaffoldWriteContract({
    contractName: "CourseManagement",
  });

  // 3. Hook para ver la lista de estudiantes (para la tabla del modal)
  const { data: students } = useScaffoldReadContract({
    contractName: "CourseManagement",
    functionName: "getStudentsByCourse",
    args: [BigInt(courseId)],
  });

  // 4. Hook para verificar si el usuario logueado ya está inscrito
  const { data: alreadyHasAccess } = useScaffoldReadContract({
    contractName: "CourseManagement",
    functionName: "isEnrolled",
    args: [userAddress, BigInt(courseId)],
  });

  // --- LÓGICA DE CÁLCULO DE PRECIO ---
  const priceInUsd = useMemo(() => {
    const marketPrice = Number(ethPriceInUsd);
    const courseEthPrice = parseFloat(priceInEth || "0");

    if (!marketPrice || !courseEthPrice) return "0.00";

    const total = courseEthPrice * marketPrice;
    return total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [ethPriceInUsd, priceInEth]);

  // --- LÓGICA DE INSCRIPCIÓN ---
  const handleEnroll = async () => {
    try {
      await writeCourseManagementAsync({
        functionName: "buyAndRegister",
        args: [BigInt(courseId)],
        value: parseEther(priceInEth),
      });
    } catch (err) {
      console.error("Error al inscribirse en el curso:", err);
    }
  };

  // --- ESTADOS DEL BOTÓN ---
  const getButtonText = () => {
    if (isOwner) return "Eres el administrador";
    if (alreadyHasAccess) return "Ya inscrito";
    return isActive ? "Inscribirse" : "No disponible";
  };

  const isButtonDisabled = !isActive || isOwner || alreadyHasAccess;

  return (
    <>
      <div className="card w-full bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
        <div className="card-body">
          {/* Badge de Estado y Botón Ver Inscritos */}
          <div className="flex justify-between items-start">
            <h2 className="card-title text-xl font-bold">{name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => (document.getElementById(`modal_${courseId}`) as any).showModal()}
                className="btn btn-ghost btn-xs btn-circle text-primary tooltip tooltip-left"
                data-tip="Ver inscritos"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              <div className={`badge ${isActive ? "badge-success" : "badge-ghost"} gap-2 font-bold`}>
                {isActive ? "Activo" : "Inactivo"}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-sm text-base-content/70 line-clamp-3 my-2">{description}</p>

          {/* Info de Precio y Estudiantes */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2">
              <div className="bg-success/10 p-1.5 rounded-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-success" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black leading-none">${priceInUsd}</span>
                <span className="text-[10px] uppercase font-bold text-base-content/40 tracking-wider mt-1">
                  {priceInEth} ETH
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-base-content/60">
              <UsersIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {studentCount} {studentCount === 1 ? "estudiante" : "estudiantes"}
              </span>
            </div>
          </div>

          {/* Acción Principal */}
          <div className="card-actions justify-end mt-6">
            <button
              onClick={handleEnroll}
              disabled={isButtonDisabled}
              className={`btn btn-primary w-full font-bold uppercase ${
                alreadyHasAccess ? "btn-outline btn-success" : ""
              }`}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL DE DAISYUI CON TABLA --- */}
      <dialog id={`modal_${courseId}`} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 border border-base-300 shadow-2xl p-0 overflow-hidden">
          {/* Header del Modal */}
          <div className="bg-primary p-6 text-primary-content flex justify-between items-center">
            <div>
              <h3 className="font-black text-2xl flex items-center gap-2">
                <UsersIcon className="w-6 h-6" />
                Estudiantes
              </h3>
              <p className="text-xs opacity-80 uppercase tracking-widest">{name}</p>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </form>
          </div>

          {/* Tabla de Estudiantes */}
          <div className="p-4">
            <div className="overflow-x-auto rounded-xl border border-base-200">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="w-12 text-center">#</th>
                    <th className="text-center">Wallet Address</th>
                  </tr>
                </thead>
                <tbody className="max-h-[300px] overflow-y-auto">
                  {students && students.length > 0 ? (
                    students.map((address, index) => (
                      <tr key={index} className="hover">
                        <th className="text-center">{index + 1}</th>
                        <td className="text-center flex justify-center">
                          <Address address={address} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center py-12">
                        <div className="flex flex-col items-center opacity-30">
                          <UsersIcon className="w-12 h-12 mb-2" />
                          <p className="font-bold">Aún no hay inscritos</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer del Modal */}
          <div className="p-4 bg-base-200 flex justify-end">
            <form method="dialog">
              <button className="btn btn-sm btn-ghost">Cerrar</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-black/40 backdrop-blur-sm">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
