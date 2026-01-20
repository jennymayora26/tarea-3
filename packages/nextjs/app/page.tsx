"use client";

import { useMemo, useState } from "react";
import { BookOpenIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/20/solid";
import { CourseCard } from "~~/components/CourseCard";

export interface Course {
  id: string;
  name: string;
  description: string;
  price: number; // Cambiado a string para manejar formatEther de viem
  isActive: boolean;
  studentCount: number;
}

type SortOption = "name" | "price-asc" | "price-desc" | "students";

// Datos de ejemplo
const mockCourses: Course[] = [
  {
    id: "1",
    name: "Introducción a React",
    description:
      "Aprende los conceptos básicos de React y cómo crear componentes reutilizables. Perfect para principiantes que quieren comenzar en el desarrollo web moderno.",
    price: 49.99,
    isActive: true,
    studentCount: 1250,
  },
  {
    id: "2",
    name: "Next.js Avanzado",
    description:
      "Domina Next.js y aprende a construir aplicaciones full-stack con TypeScript, API routes y bases de datos. Para desarrolladores con experiencia en React.",
    price: 79.99,
    isActive: true,
    studentCount: 856,
  },
  {
    id: "3",
    name: "Tailwind CSS Masterclass",
    description:
      "Crea diseños hermosos y responsive usando Tailwind CSS. Aprende a personalizar temas y optimizar tus proyectos.",
    price: 39.99,
    isActive: true,
    studentCount: 2104,
  },
  {
    id: "4",
    name: "TypeScript Completo",
    description:
      "Aprende TypeScript desde cero. Tipado estático, interfaces, genéricos y mucho más para escribir código más seguro.",
    price: 59.99,
    isActive: true,
    studentCount: 1567,
  },
  {
    id: "5",
    name: "Bases de Datos con PostgreSQL",
    description:
      "Domina PostgreSQL y aprende a diseñar bases de datos eficientes. Incluye SQL avanzado y optimización.",
    price: 69.99,
    isActive: true,
    studentCount: 743,
  },
  {
    id: "6",
    name: "GraphQL API",
    description: "Construye APIs modernas con GraphQL. Aprende queries, mutations, subscriptions y autenticación.",
    price: 74.99,
    isActive: false,
    studentCount: 412,
  },
  {
    id: "7",
    name: "Autenticación y Seguridad",
    description: "Implementa sistemas de autenticación seguros. OAuth, JWT, sesiones y mejores prácticas de seguridad.",
    price: 64.99,
    isActive: true,
    studentCount: 892,
  },
  {
    id: "8",
    name: "Testing en JavaScript",
    description: "Aprende a escribir tests unitarios e integración con Jest, Vitest y React Testing Library.",
    price: 54.99,
    isActive: true,
    studentCount: 634,
  },
  {
    id: "9",
    name: "DevOps para Desarrolladores",
    description: "Despliega tus aplicaciones en producción. Docker, CI/CD, Vercel y gestión de infraestructura.",
    price: 89.99,
    isActive: false,
    studentCount: 523,
  },
];

export default function Home() {
  const handleEnroll = (courseId: string) => {
    const course = mockCourses.find(c => c.id === courseId);
    console.log(`[v0] Usuario se inscribió al curso: ${course?.name}`);
    // Aquí iría la lógica para inscribirse al curso
    alert(`¡Te has inscrito a ${course?.name}!`);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = mockCourses.filter(course => {
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
  }, [searchQuery, statusFilter, sortBy]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* <CoursesSection courses={mockCourses} onEnroll={handleEnroll} /> */}

        <section className="w-full max-w-7xl mx-auto p-4 space-y-8">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-base-300 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpenIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-4xl font-black">Catálogo Web3</h2>
              </div>
              <p className="text-base-content/60 text-lg">
                Explora {mockCourses.length} curso{mockCourses.length !== 1 ? "s" : ""} disponibles en la blockchain.
              </p>
            </div>
          </div>

          {/* FILTERS & SEARCH BAR */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
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
              {/* Status Select */}
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

              {/* Sort Select */}
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

          {/* COURSES GRID */}
          {filteredAndSortedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedCourses.map(course => (
                <CourseCard
                  key={course.id}
                  name={course.name}
                  description={course.description}
                  price={course.price}
                  isActive={course.isActive}
                  studentCount={course.studentCount}
                  onEnroll={() => handleEnroll?.(course.id)}
                  // isOwner={connectedAddress === ownerAddress}
                  isOwner={true}
                  // alreadyHasAccess={userPurchases.includes(BigInt(course.id))}
                  alreadyHasAccess={true}
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

          {/* FOOTER INFO */}
          <div className="badge badge-outline p-4 gap-2 opacity-70">
            <span className="font-bold">{filteredAndSortedCourses.length}</span> resultados encontrados
          </div>
        </section>
      </div>
    </main>
  );
}
