"use client";

import { useMemo } from "react";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { parseEther } from "viem";
import { CurrencyDollarIcon, UsersIcon } from "@heroicons/react/20/solid";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CourseCardProps {
  courseId: string;
  name: string;
  description: string;
  price: string;
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
  const ethPriceInUsd = useFetchNativeCurrencyPrice();

  //smart contract
  const { writeContractAsync: writeCourseManagementAsync } = useScaffoldWriteContract({
    contractName: "CourseManagement",
  });

  const priceInUsd = useMemo(() => {
    // Si ethPriceInUsd es un objeto, intentamos sacar .price, si no, lo tomamos directo.
    const rawPrice = typeof ethPriceInUsd === "object" ? ethPriceInUsd.price : ethPriceInUsd;
    const marketPrice = parseFloat(rawPrice?.toString() || "0");
    const courseEthPrice = parseFloat(priceInEth?.toString() || "0");

    if (marketPrice <= 0 || courseEthPrice <= 0) return "0.00";

    const total = courseEthPrice * marketPrice;
    return total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [ethPriceInUsd, priceInEth]);
  // Smart Contract: Verificamos si el usuario ya tiene acceso
  const { data: alreadyHasAccess } = useScaffoldReadContract({
    contractName: "CourseManagement",
    functionName: "isEnrolled",
    args: [userAddress, BigInt(courseId)],
  });

  const getButtonText = () => {
    if (isOwner) return "Eres el administrador";
    if (alreadyHasAccess) return "Ya inscrito";
    return isActive ? "Inscribirse" : "No disponible";
  };

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

        {/* Acción */}
        <div className="card-actions justify-end mt-6">
          <button
            onClick={handleEnroll}
            disabled={isButtonDisabled}
            className={`btn btn-primary w-full font-bold uppercase ${alreadyHasAccess ? "btn-outline btn-success" : ""}`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
