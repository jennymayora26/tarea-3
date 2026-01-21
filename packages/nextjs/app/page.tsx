"use client";

import { useMemo, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { BookOpenIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/20/solid";
import { CourseCard } from "~~/components/CourseCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type SortOption = "name" | "price-asc" | "price-desc" | "students";

export default function Home() {
  const { address: userAddress } = useAccount();

  //states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // --- SMART CONTRACT DATA ---
  const { data: courses } = useScaffoldReadContract({
    contractName: "CourseManagement",
    functionName: "getAllCourses",
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "CourseManagement",
    functionName: "owner",
  });

  const filteredAndSortedCourses = useMemo(() => {
    // Si no hay data del contrato, devolvemos array vacío
    if (!courses) return [];

    const blockchainData = courses.map(c => ({
      id: c.id.toString(),
      name: c.name,
      description: c.description,
      price: formatEther(c.price),
      isActive: c.active,
      studentCount: Number(c.enrolledCount),
    }));

    const filtered = blockchainData.filter(course => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && course.isActive) ||
        (statusFilter === "inactive" && !course.isActive);

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "students":
          return b.studentCount - a.studentCount;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [courses, searchQuery, statusFilter, sortBy]);

  if (courses === undefined || userAddress === undefined) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner principal */}
          <span className="loading loading-ring loading-lg text-primary scale-150"></span>

          {/* Texto con efecto de pulso */}
          <div className="flex flex-col items-center animate-pulse">
            <p className="text-xl font-black tracking-tighter">Sincronizando bloques</p>
            <p className="text-sm text-base-content/40">Consultando smart contract...</p>
          </div>

          {/* Grid de esqueletos (opcional, para dar forma al catálogo) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 opacity-20 pointer-events-none">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-base-300 w-72 h-96 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <section className="w-full max-w-7xl mx-auto p-4 space-y-8">
          {/* HEADER SECTION - Tus clases originales */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-base-300 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpenIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-4xl font-black">Catálogo Web3</h2>
              </div>
              <p className="text-base-content/60 text-lg">
                Explora {courses?.length || 0} curso{courses?.length !== 1 ? "s" : ""} disponibles en la blockchain.
              </p>
            </div>
          </div>

          {/* FILTERS & SEARCH BAR - Tus clases originales */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                className="input input-bordered w-full pl-12 bg-base-200 focus:input-primary transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="form-control w-full md:w-48">
                <div className="input-group">
                  <select
                    className="select select-bordered w-full bg-base-200"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Solo Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>

              <div className="form-control w-full md:w-56">
                <select
                  className="select select-bordered w-full bg-base-200 font-medium"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                >
                  <option value="name">Ordenar por: Nombre</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="students">Más Populares</option>
                </select>
              </div>
            </div>
          </div>

          {/* COURSES GRID - Tus clases originales */}
          {filteredAndSortedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedCourses.map(course => (
                <CourseCard
                  key={course.id}
                  courseId={course.id}
                  name={course.name}
                  description={course.description}
                  price={course.price}
                  isActive={course.isActive}
                  studentCount={course.studentCount}
                  isOwner={userAddress === owner}
                  userAddress={userAddress}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-base-200 rounded-3xl border-2 border-dashed border-base-300">
              <MagnifyingGlassCircleIcon className="w-16 h-16 text-base-content/20 mb-4" />
              <h3 className="text-xl font-bold italic">No se encontró nada en los bloques...</h3>
              <p className="text-base-content/50">Intenta con otros términos de búsqueda.</p>
            </div>
          )}

          {/* FOOTER INFO - Tus clases originales */}
          <div className="badge badge-outline p-4 gap-2 opacity-70">
            <span className="font-bold">{filteredAndSortedCourses.length}</span> resultados encontrados
          </div>
        </section>
      </div>
    </main>
  );
}
