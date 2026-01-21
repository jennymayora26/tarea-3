// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CourseManagement is Ownable, ReentrancyGuard {
    struct Course {
        uint256 id;
        string name;
        string description;
        uint256 price;
        bool active;
        uint256 enrolledCount;
    }

    struct Registration {
        uint256 courseId;
        bool hasAccess;
        bool exists;
    }

    uint256 public courseCount;
    mapping(uint256 => Course) public courses;
    mapping(address => mapping(uint256 => Registration)) public studentRegistrations;
    mapping(uint256 => address[]) public courseStudents;

    event CourseCreated(uint256 id, string name, uint256 price);
    event CoursePurchased(address indexed student, uint256 courseId, uint256 totalEnrolled);

    constructor(address _owner) Ownable(_owner) {}

    // --- FUNCIONES DEL ADMIN ---

    function createCourse(string memory _name, string memory _description, uint256 _price) public onlyOwner {
        courseCount++;
        courses[courseCount] = Course(courseCount, _name, _description, _price, true, 0);
        emit CourseCreated(courseCount, _name, _price);
    }

    function getStudentsByCourse(uint256 _courseId) public view returns (address[] memory) {
        return courseStudents[_courseId];
    }

    // --- FUNCIONES DEL ESTUDIANTE ---

    function buyAndRegister(uint256 _courseId) public payable nonReentrant {
        Course storage course = courses[_courseId];

        // 1. VALIDACIÓN: El curso debe existir
        require(course.active, "El curso no existe");

        // 2. VALIDACIÓN: El admin NO puede comprar sus cursos
        require(msg.sender != owner(), "El administrador no puede comprar sus cursos");

        // 3. VALIDACIÓN: No comprar dos veces el mismo curso
        require(!studentRegistrations[msg.sender][_courseId].exists, "Ya estas registrado en este curso");

        // 4. VALIDACIÓN: Pago correcto
        require(msg.value >= course.price, "Pago insuficiente");

        // Lógica de registro
        studentRegistrations[msg.sender][_courseId] = Registration({
            courseId: _courseId,
            hasAccess: true,
            exists: true
        });

        course.enrolledCount++;
        courseStudents[_courseId].push(msg.sender);

        emit CoursePurchased(msg.sender, _courseId, course.enrolledCount);
    }

    /**
     * @notice Devuelve todos los cursos creados hasta el momento
     * @return Un array con todos los structs de Course
     */
    function getAllCourses() public view returns (Course[] memory) {
        Course[] memory allCourses = new Course[](courseCount);

        for (uint256 i = 1; i <= courseCount; i++) {
            allCourses[i - 1] = courses[i];
        }

        return allCourses;
    }

    /**
     * @notice Verifica si un estudiante específico está registrado en un curso
     * @param _student La dirección de la billetera del estudiante
     * @param _courseId El ID del curso a consultar
     * @return bool True si el estudiante ya compró el curso
     */
    function isEnrolled(address _student, uint256 _courseId) public view returns (bool) {
        return studentRegistrations[_student][_courseId].exists;
    }
}
