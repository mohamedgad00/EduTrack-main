"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import { createCourse, updateCourse, clearCourseState } from "@/redux/features/courses/coursesSlice";
import { showToast } from "@/utils/toastUtils";
import { Course } from "@/types/course";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const formSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  level: z.string().min(1, "Level is required"),
  class: z.string().min(1, "Class is required"),
  description: z.string().min(1, "Description is required"),
  teacherId: z.string().min(1, "Please select a teacher"),
  studentIds: z.array(z.string()).min(1, "Please select at least one student"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  teachers: Array<{ id: string; name: string }>;
  students: Array<{ id: string; name: string }>;
}

export default function AddCourseModal({
  isOpen,
  onClose,
  courseToEdit,
  teachers,
  students,
}: AddCourseModalProps) {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.courses);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level: "",
      class: "",
      description: "",
      teacherId: "",
      studentIds: [],
    },
  });

  const selectedStudents = useWatch({
    control,
    name: "studentIds",
    defaultValue: [],
  });

  useEffect(() => {
    if (courseToEdit) {
      setValue("name", courseToEdit.name);
      setValue("level", courseToEdit.level);
      setValue("class", courseToEdit.class);
      setValue("description", courseToEdit.description);
      setValue("teacherId", courseToEdit.teacherId);
      setValue("studentIds", courseToEdit.studentIds);
    }
  }, [courseToEdit, setValue]);

  const handleAddStudent = (studentId: string) => {
    if (!selectedStudents.includes(studentId)) {
      const newStudents = [...selectedStudents, studentId];
      setValue("studentIds", newStudents);
    }
    setShowStudentDropdown(false);
  };

  const handleRemoveStudent = (studentId: string) => {
    const newStudents = selectedStudents.filter((id) => id !== studentId);
    setValue("studentIds", newStudents);
  };

  const toAssignedStudents = (studentIds: string[]) => {
    return studentIds.map((id) => {
      const student = students.find((s) => s.id === id);
      return { id, name: student?.name || "" };
    });
  };

  const syncAssessmentStudents = (
    studentIds: string[],
    studentRecords: Array<{ studentId: string; studentName: string; grade?: number; isPresent: boolean }>
  ) => {
    return studentIds.map((id) => {
      const existing = studentRecords.find((record) => record.studentId === id);
      const student = students.find((s) => s.id === id);
      return {
        studentId: id,
        studentName: student?.name || "",
        grade: existing?.grade,
        isPresent: existing?.isPresent ?? true,
      };
    });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (courseToEdit) {
        // Update existing course
        const action = await dispatch(updateCourse({
          ...courseToEdit,
          ...data,
          studentIds: data.studentIds,
          students: toAssignedStudents(data.studentIds),
          quizzes: courseToEdit.quizzes.map((quiz) => ({
            ...quiz,
            studentRecords: syncAssessmentStudents(data.studentIds, quiz.studentRecords),
          })),
          homeworks: courseToEdit.homeworks.map((hw) => ({
            ...hw,
            studentRecords: syncAssessmentStudents(data.studentIds, hw.studentRecords),
          })),
          midtermExam: courseToEdit.midtermExam
            ? {
              ...courseToEdit.midtermExam,
              studentRecords: syncAssessmentStudents(data.studentIds, courseToEdit.midtermExam.studentRecords),
            }
            : null,
          finalExam: courseToEdit.finalExam
            ? {
              ...courseToEdit.finalExam,
              studentRecords: syncAssessmentStudents(data.studentIds, courseToEdit.finalExam.studentRecords),
            }
            : null,
          updatedAt: new Date().toISOString(),
        }));

        if (updateCourse.rejected.match(action)) {
          showToast("error", (action.payload as string) ?? "Failed to update course");
          return;
        }

        showToast("success", "Course updated successfully!");
      } else {
        // Create new course
        const action = await dispatch(createCourse(data));
        if (createCourse.rejected.match(action)) {
          showToast("error", (action.payload as string) ?? "Failed to create course");
          return;
        }

        showToast("success", "Course created successfully!");
      }
      handleClose();
    } catch (error) {
      console.error("Error saving course:", error);
      showToast("error", "Failed to save course");
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearCourseState());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {courseToEdit ? t("Edit Course") : t("Create New Course")}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Course Name")} *
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder={t("e.g., Mathematics 101")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.name && (
                <p className="mt-1 text-sm text-red-500">{t(errors.name.message ?? "")}</p>
            )}
          </div>

          {/* Level and Class */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Level")} *
              </label>
              <input
                {...register("level")}
                type="text"
                placeholder={t("e.g., Grade 10")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.level && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.level.message ?? "")}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Class")} *
              </label>
              <input
                {...register("class")}
                type="text"
                placeholder={t("e.g., A-1")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.class && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.class.message ?? "")}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Description")} *
            </label>
            <textarea
              {...register("description")}
              placeholder={t("Course description...")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{t(errors.description.message ?? "")}</p>
            )}
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Select Teacher")} *
            </label>
            <select
              {...register("teacherId")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("Choose a teacher...")}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-500">{t(errors.teacherId.message ?? "")}</p>
            )}
          </div>

          {/* Students Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("Assign Students")} *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {selectedStudents.length > 0
                    ? t("selected.students.count").replace("{count}", String(selectedStudents.length))
                    : t("Select students...")}
                </span>
                <Plus size={16} />
              </button>

              {showStudentDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {students
                    .filter((s) => !selectedStudents.includes(s.id))
                    .map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleAddStudent(student.id)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                      >
                        {student.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Selected Students List */}
            {selectedStudents.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedStudents.map((studentId) => {
                  const student = students.find((s) => s.id === studentId);
                  return (
                    <div
                      key={studentId}
                      className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                    >
                      <span className="text-sm text-gray-700">{student?.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(studentId)}
                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.studentIds && (
              <p className="mt-1 text-sm text-red-500">{t(errors.studentIds.message ?? "")}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("Saving...") : courseToEdit ? t("Update Course") : t("Create Course")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
