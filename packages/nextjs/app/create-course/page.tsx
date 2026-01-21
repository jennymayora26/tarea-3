"use client";

import React, { useState } from "react";
import { EtherInput } from "@scaffold-ui/components";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { RocketLaunchIcon } from "@heroicons/react/20/solid";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function CreateCoursePage() {
  const { address: userAddress } = useAccount();

  //states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [resetKey, setResetKey] = useState(0);

  //smart contract
  const { data: owner } = useScaffoldReadContract({
    contractName: "CourseManagement",
    functionName: "owner",
  });

  const { writeContractAsync: writeCourseAsync } = useScaffoldWriteContract({
    contractName: "CourseManagement",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await writeCourseAsync({
        functionName: "createCourse",
        args: [formData.name, formData.description, parseEther(formData.price || "0")],
      });

      toast.success("Curso creado exitosamente");
      setFormData({ name: "", description: "", price: "" });
      setResetKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-xl bg-base-100 shadow-xl border border-base-300 mt-8 rounded-xl">
        <div className="card-body p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <RocketLaunchIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-none">Crear Curso</h2>
              <p className="text-xs text-base-content/50 mt-1">Completa la información del nuevo módulo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Nombre con rounded-md */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold">Nombre</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Ej: Master en Desarrollo Web"
                className="input input-bordered w-full focus:input-primary bg-base-100 rounded-md"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Textarea con rounded-md */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold">Descripción</span>
              </label>
              <textarea
                name="description"
                placeholder="¿De qué trata este curso?"
                className="textarea textarea-bordered w-full h-28 resize-none focus:textarea-primary rounded-md"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* EtherInput - Respetando bordes y ancho */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold">Precio</span>
              </label>
              <div className="w-full [&_.flex]:w-full [&_input]:rounded-l-md [&_.btn]:rounded-r-md">
                <EtherInput
                  key={`ether-input-${resetKey}`}
                  placeholder="0.00"
                  name="price"
                  defaultUsdMode={true}
                  onValueChange={value => {
                    setFormData(prev => ({ ...prev, price: value.valueInEth }));
                  }}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-primary btn-block text-white font-bold uppercase rounded-md"
                disabled={
                  formData.name === "" || formData.description === "" || formData.price === "" || userAddress !== owner
                }
              >
                Publicar Curso
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
