"use client"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Mail, GraduationCap, Hash } from "lucide-react"
import Image from "next/image"

interface StudentIDCardProps {
  student: any
  cardData: any
  qrCode: string
}

export function StudentIDCard({ student, cardData, qrCode }: StudentIDCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "suspended":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="w-[400px] h-[300px] bg-gradient-to-br from-gay-100 to-gray-100 rounded-lg shadow-lg overflow-hidden relative print:shadow-none">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-3 ">
        <div className="flex justify-between items-center">
          <div className="flex flex-row">
          <Image
            src={"/images/mau.png"}
            alt="Student"
            width={50}
            height={50}
          />
          <div className="mt-2">
            <h3 className="font-bold text-sm">Modibbo Adama University</h3>
            <p className="text-xs opacity-90">Student Identification Card</p>
          </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(student.status)}`}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4  flex gap-4 h-full">
        {/* Left Side - Student Info */}
        <div className="flex-1 space-y-2">
          {/* Profile Image Placeholder */}
          <div className="w-16 h-16 bg-[#e56717] rounded-lg flex items-center justify-center mb-3">
            {student.profile_image ? (
              <img
                src={student.profile_image || "/placeholder.svg"}
                alt="Student"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <User className="w-8 h-8 text-white " />
            )}
          </div>

          {/* Student Details */}
          <div className="space-y-1">
            <h4 className="font-bold text-lg leading-tight">
              {student.first_name} {student.last_name}
            </h4>
            <div className="flex items-center gap-1 text-xs">
              <Hash className="w-3 h-3" />
              <span className="font-mono">{student.student_id}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <GraduationCap className="w-3 h-3" />
              <span>{student.department}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{student.year_level}</span>
            </div>
          </div>
        </div>

        {/* Right Side - QR Code */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-white p-2 rounded-lg">
            <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-20 h-20" />
          </div>
          <p className="text-xs  text-center opacity-90">Scan to Verify</p>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="absolute mt-4  bg-gray-500 backdrop-blur-sm p-2">
        <div className="flex justify-between items-center text-xs text-white/90">
          <span>University Student Services</span>
          <Badge variant="secondary" className="text-xs">
            {student.status.toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  )
}
