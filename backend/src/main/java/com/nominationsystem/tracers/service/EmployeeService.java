package com.nominationsystem.tracers.service;

import com.nominationsystem.tracers.models.ApprovalStatus;
import com.nominationsystem.tracers.models.NominatedCourseStatus;
import com.nominationsystem.tracers.models.Employee;
import com.nominationsystem.tracers.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    // public Employee addEmployee(Employee employee) {
    // String hashedPassword =
    // utilityServices.encodePassword(employee.getHashPswd());
    // employee.setHashPswd(hashedPassword);
    // Employee save = this.employeeRepository.save(employee);
    // return save;
    // }

    public List<Employee> getAllEmployees() {
        return this.employeeRepository.findAll();
    }

    public ResponseEntity<?> getEmpByEmail(@RequestBody Map<String, String> requestBody) {
        String email = requestBody.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("Email is required in the request body.");
        }

        Optional<Employee> employee = this.employeeRepository.findByEmail(email);
        if (employee != null) {
            return ResponseEntity.ok(employee);
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    // public ResponseEntity<?> setAdmin(String email,Boolean isAdmin){
    // Optional<Employee> employee = employeeRepository.findByEmail(email);
    //
    // if(employee != null) {
    // employee.ifPresent(emp -> {
    // emp.setIsAdmin(isAdmin);
    // });
    // employeeRepository.save(employee.get());
    // return ResponseEntity.ok(employee.get());
    // } else {
    // return ResponseEntity.notFound().build();
    // }
    // }

    public ResponseEntity<?> setRole(String email, String role) {
        Optional<Employee> employee = employeeRepository.findByEmail(email);

        if (employee != null) {
            employee.ifPresent(emp -> {
                emp.setRole(role);
            });
            employeeRepository.save(employee.get());
            return ResponseEntity.ok(employee.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public ResponseEntity<?> addCourses(String email, String courseIds) {
        List<String> courseIdList = Arrays.asList(courseIds.split(","));

        Optional<Employee> employee = employeeRepository.findByEmail(email);
        if (employee != null) {
            employee.ifPresent(emp -> {
                if (emp.getCourseIds() != null) {
                    emp.getCourseIds().addAll(courseIdList);
                } else
                    emp.setCourseIds(courseIdList);
            });
            employeeRepository.save(employee.get());
            return ResponseEntity.ok(employee.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public Employee getEmployee(String empId) {
        return this.employeeRepository.findByEmpId(empId);
    }

    public void setCoursesNominatedByEmployee(String empId, List<NominatedCourseStatus> nominatedCourses) {
        Employee employee = this.employeeRepository.findByEmpId(empId);

        List<String> approvedCourses = new ArrayList<>();
        List<String> pendingCourses = new ArrayList<>();

        nominatedCourses.forEach(nominatedCourse -> {
            if (nominatedCourse.getApprovalStatus().equals(ApprovalStatus.APPROVED))
                approvedCourses.add(nominatedCourse.getCourseName());
            else if (nominatedCourse.getApprovalStatus().equals(ApprovalStatus.PENDING))
                pendingCourses.add(nominatedCourse.getCourseName());
        });

        if (employee.getApprovedCourses() == null)
            employee.setApprovedCourses(new ArrayList<>());
        employee.getApprovedCourses().addAll(approvedCourses);

        if (employee.getPendingCourses() == null)
            employee.setPendingCourses(new ArrayList<>());
        employee.getPendingCourses().addAll(pendingCourses);

        this.employeeRepository.save(employee);
    }

    public Map<String, List<String>> getCoursesNominatedByEmployee(String empId) {
        Employee employee = this.getEmployee(empId);
        Map<String, List<String>> courseList = new HashMap<>();
        courseList.put("approvedCourses", employee.getApprovedCourses());
        courseList.put("pendingCourses", employee.getPendingCourses());
        return courseList;
    }

    public void updateCoursesNominatedByEmployee(String empId, String courseName, String action) {
        Employee employee = this.employeeRepository.findByEmpId(empId);

        if (action.equals("approve")) {
            employee.getPendingCourses().remove(courseName);
            if (!employee.getApprovedCourses().contains(courseName))
                employee.getApprovedCourses().add(courseName);
        }
        else if (action.equals("reject")) {
            employee.getPendingCourses().remove(courseName);
        }
        employeeRepository.save(employee);
    }

}
