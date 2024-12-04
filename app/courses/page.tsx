"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course {
  序号: string;
  课程: string;
  学分: string;
  总学时: string;
  类别: string;
  开课校区: string;
  选课号: string;
  任课教师: string;
  投入选课币: string;
  购买教材: string;
  重修: string;
  上课班调剂: string;
  选课方式: string;
  选课状态: string;
  备注: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [peekResults, setPeekResults] = useState<any[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 获取课程列表
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      router.push("/auth");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "https://magic.nas.jrhim.com/fetch_course_info",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.error("获取课程失败：", error);
        alert("获取课程信息失败，请稍后重试");
      }
    };

    fetchCourses();
  }, [router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setJsonFile(files[0]);
    }
  };

  const handleHavAPeek = async () => {
    if (!selectedCourse || !jsonFile) {
      alert("请选择课程并上传文件");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://magic.nas.jrhim.com/have_a_peek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          json_str: await jsonFile.text(),
          course_id: selectedCourse.选课号,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTaskId(data.task_id);
        // 开始轮询结果
        pollResult(data.task_id);
      } else {
        alert("获取结果失败");
        setLoading(false);
      }
    } catch (error) {
      console.error("上传失败：", error);
      alert("上传出错，请稍后重试");
      setLoading(false);
    }
  };

  const pollResult = async (taskId: string) => {
    try {
      // sleep 1s
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await fetch(
        `https://magic.nas.jrhim.com/peek_result/${taskId}`
      );
      if (response.ok) {
        const data = await response.json();

        if (data.status === "done") {
          // 处理完成的结果
          const results = JSON.parse(data.result);
          const sortedResults = results.sort(
            (a: any, b: any) =>
              parseFloat(b.投入选课币) - parseFloat(a.投入选课币)
          );
          setPeekResults(sortedResults);
          setLoading(false);
          setProgress(100);
        } else if (data.status === "processing") {
          // 更新进度并继续轮询
          setProgress(data.progress);
          setTimeout(() => pollResult(taskId), 1000); // 每秒轮询一次
        }
      } else {
        throw new Error("Failed to fetch result");
      }
    } catch (error) {
      console.error("轮询结果失败：", error);
      alert("获取结果失败，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">我的课程表</h1>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/auth");
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            退出登录
          </button>
        </div>

        {/* 课程列表 */}
        <div className="grid gap-6 mb-6">
          {courses.map((course) => (
            <div
              key={course.选课号}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all
                ${
                  selectedCourse?.选课号 === course.选课号
                    ? "ring-2 ring-blue-500"
                    : "hover:shadow-lg"
                }`}
              onClick={() => setSelectedCourse(course)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-full">
                  <h2 className="text-xl font-semibold text-blue-600">
                    {course.课程.split("]")[1]}{" "}
                    {/* 移除课程代码，只显示课程名 */}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    课程代码：{course.课程.split("]")[0].replace("[", "")}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">任课教师：</span>
                    {course.任课教师.split("]")[1]} {/* 只显示教师姓名 */}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">学分：</span>
                    {course.学分}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">总学时：</span>
                    {course.总学时}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">课程类别：</span>
                    {course.类别}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">开课校区：</span>
                    {course.开课校区}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">选课号：</span>
                    {course.选课号}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">选课状态：</span>
                    <span
                      className={`${
                        course.选课状态 === "选中"
                          ? "text-green-600"
                          : "text-yellow-600"
                      } font-medium`}
                    >
                      {course.选课状态}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">选课方式：</span>
                    {course.选课方式}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">投入选课币：</span>
                    {course.投入选课币}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">购买教材：</span>
                    {course.购买教材}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">重修：</span>
                    {course.重修}
                  </p>
                  {course.备注 && (
                    <p className="text-gray-700">
                      <span className="font-semibold">备注：</span>
                      {course.备注}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 文件上传区域 */}
        {selectedCourse && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              已选课程：{selectedCourse.课程.split("]")[1]}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="block w-full text-gray-500"
                />
                <button
                  onClick={handleHavAPeek}
                  disabled={!jsonFile || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                disabled:bg-gray-300 disabled:cursor-not-allowed w-60"
                >
                  {loading ? "处理中..." : "瞅一瞅"}
                </button>
              </div>

              {loading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    处理进度：{progress.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {peekResults.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              查询结果
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left text-gray-600">姓名</th>
                    <th className="p-2 text-left text-gray-600">学号</th>
                    <th className="p-2 text-left text-gray-600">投入选课币</th>
                  </tr>
                </thead>
                <tbody>
                  {peekResults.map((result, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-gray-700">{result.姓名}</td>
                      <td className="p-2 text-gray-700">{result.学号}</td>
                      <td className="p-2 text-gray-700">{result.投入选课币}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
