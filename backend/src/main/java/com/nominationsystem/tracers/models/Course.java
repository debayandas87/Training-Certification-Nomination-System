package com.nominationsystem.tracers.models;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.format.annotation.DateTimeFormat;

import java.text.SimpleDateFormat;
import java.util.Date;

@Getter
@Setter
@Document(collection = "Course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private String courseId;


    private String name;

    private Integer duration;

    private String category;

    private Boolean isApprovalReq;

    private String publishedDate=new SimpleDateFormat("dd-MM-yyyy").format(new Date());
}