# Courses Management System

## Overview

The Courses Management System is a comprehensive module within the EduTrack platform that allows administrators to create and manage courses, assign teachers and students, and monitor grades and attendance.

## Features

### 1. Course Creation & Management

- **Create Courses**: Add new courses with the following details:
  - Course Name
  - Level (e.g., Grade 10, Grade 11)
  - Class (e.g., A-1, B-2)
  - Description
  - Teacher Assignment
  - Student Assignment

- **Edit Courses**: Modify existing course details
- **Delete Courses**: Remove courses from the system
- **View Course Details**: See detailed course information with statistics

### 2. Grade Management

The system tracks four types of assignments:

- **Quizzes** - Regular assessment
- **Midterm** - Mid-semester examination
- **Final** - Final examination
- **Homework** - Coursework and assignments

#### Features:

- Enter grades for each student (0-100)
- Automatic average calculation
- View class-wide statistics (average, highest, lowest grades)
- Export grade reports

### 3. Attendance Tracking

- **Add Attendance Dates**: Create date entries for attendance marking
- **Mark Attendance**: Toggle between Present and Absent for each student
- **Attendance Statistics**:
  - Total Present/Absent count
  - Attendance percentage for each student
  - Class-wide average attendance

#### Features:

- Visual indicators (Green for Present, Red for Absent)
- Quick date management
- Attendance history tracking

### 4. Reporting & Analytics

- **Grade Reports**:
  - Class average
  - Highest and lowest grades
  - Individual student performance
- **Attendance Reports**:
  - Student-wise attendance percentage
  - Class average attendance
  - Present/Absent counts

## Usage Guide

### Creating a Course

1. Navigate to **Management > Courses** from the sidebar
2. Click **Create Course** button
3. Fill in the course details:
   - Course name
   - Level and Class
   - Description
   - Select a Teacher
   - Assign Students (can add multiple)
4. Click **Create Course**

### Managing Grades

1. Go to Courses Management page
2. Find the course card
3. Click **Grades** button
4. Enter grades for each student (0-100)
5. Grades are automatically averaged
6. Click **Save Grades**

### Managing Attendance

1. Go to Courses Management page
2. Find the course card
3. Click **Attendance** button
4. Add attendance dates using the date input
5. Click the Present/Absent buttons to mark attendance
6. System automatically calculates totals and percentages
7. Click **Save Attendance**

### Viewing Course Details & Reports

1. Go to Courses Management page
2. Click on a course card or view button
3. See detailed:
   - Course information
   - Grade statistics
   - Individual grade reports
   - Attendance reports

## Technical Implementation

### Redux State Management

The system uses Redux for state management with the following slice:

- `coursesSlice`: Manages courses CRUD operations and state

### Components

- **CoursesPage**: Main courses listing and management page
- **AddCourseModal**: Create/Edit course form
- **GradeModal**: Grade entry and management interface
- **AttendanceModal**: Attendance marking interface
- **CourseDetailsPage**: Detailed course view with reports

### Types

All TypeScript types are defined in `types/course.ts`:

- `Course`: Main course entity
- `StudentGrade`: Grade information per student
- `StudentAttendance`: Attendance information per student
- `AssignmentType`: Types of assignments (Quizzes, Midterm, Final, Homework)

### Data Structure

```typescript
interface Course {
  id: string;
  name: string;
  level: string;
  class: string;
  description: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  students: { id: string; name: string }[];
  grades: StudentGrade[];
  attendance: StudentAttendance[];
  createdAt: string;
  updatedAt: string;
}
```

## Features Map

| Feature              | Location                  | Status      |
| -------------------- | ------------------------- | ----------- |
| Create Course        | `/admin/courses`          | ✅ Complete |
| Edit Course          | `/admin/courses`          | ✅ Complete |
| Delete Course        | `/admin/courses`          | ✅ Complete |
| Manage Grades        | Modal in `/admin/courses` | ✅ Complete |
| Manage Attendance    | Modal in `/admin/courses` | ✅ Complete |
| View Reports         | `/admin/courses/[id]`     | ✅ Complete |
| Grade Analytics      | `/admin/courses/[id]`     | ✅ Complete |
| Attendance Analytics | `/admin/courses/[id]`     | ✅ Complete |

## Future Enhancements

- Email notifications for low grades
- Grade export to PDF/Excel
- Attendance calendar view
- Bulk grade import
- Student grade trends
- Parent notifications
- Mobile app integration

## Mock Data

Currently, the system includes mock data for:

- **Teachers**: 4 sample teachers
- **Students**: 10 sample students

To integrate with a real backend API:

1. Update the `coursesSlice` to include async thunks
2. Modify the CoursesPage to fetch from API
3. Update modal components to call API endpoints

## Notes

- All grades are on a scale of 0-100
- Attendance percentages are automatically calculated
- Course creation requires at least one student assignment
- Teachers can view and modify grades/attendance for their courses
- Admin can view and modify all courses
