// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract YourContract {
    address public immutable owner;

    struct Course {
        uint256 id;
        string name;
        string description;
        uint256 price; // En Wei
        bool active;
    }

    struct Registration {
        uint256 courseId;
        bool isApproved;
        bool exists;
    }

    uint256 public courseCount;
    mapping(uint256 => Course) public courses;
    // Estudiante => ID del curso => Registro
    mapping(address => mapping(uint256 => Registration)) public studentRegistrations;
    address[] public allStudents;

    modifier onlyOwner() {
        require(msg.sender == owner, "No eres el admin");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    // --- FUNCIONES DEL ADMIN ---

    function createCourse(string memory _name, string memory _description, uint256 _price) public onlyOwner {
        courseCount++;
        courses[courseCount] = Course(courseCount, _name, _description, _price, true);
    }

    function approvePayment(address _student, uint256 _courseId) public onlyOwner {
        require(studentRegistrations[_student][_courseId].exists, "No existe registro");
        studentRegistrations[_student][_courseId].isApproved = true;
    }

    // --- FUNCIONES DEL ESTUDIANTE ---

    function registerInCourse(uint256 _courseId) public {
        require(courses[_courseId].active, "El curso no existe o no esta activo");
        require(!studentRegistrations[msg.sender][_courseId].exists, "Ya estas registrado");

        studentRegistrations[msg.sender][_courseId] = Registration({
            courseId: _courseId,
            isApproved: false,
            exists: true
        });
        
        allStudents.push(msg.sender);
    }
}