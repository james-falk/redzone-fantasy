import { promises as fs } from 'fs'
import path from 'path'

export interface Course {
  title: string
  shortDescription: string
  cover: string
  slug: string
  category: string
  publishDate: string
  duration: string
  features: string[]
}

// Function to read a course file
const readCourseFile = async (filePath: string): Promise<Course> => {
  const fileData = await fs.readFile(filePath, 'utf8')
  return JSON.parse(fileData) as Course
}

// Function to get all courses
export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const coursesPath = path.join(process.cwd(), 'content/courses')
    const courseFiles = await fs.readdir(coursesPath)

    const courses = await Promise.all(
      courseFiles.map(async (fileName) => {
        const filePath = path.join(coursesPath, fileName)
        return await readCourseFile(filePath)
      })
    )

    return courses
  } catch (error: unknown) {
    // Handle errors
    console.error('Error:', error)
    return []
  }
}

// Function to get a single course by its slug
export const getOneCourse = async (slug: string): Promise<Course | null> => {
  try {
    const courses = await getAllCourses()
    const course = courses.find((course) => course.slug === slug)

    return course || null
  } catch (error: unknown) {
    console.error('Error:', error)

    return null
  }
}
