import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, QrCode, Shield, BarChart3 } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className='flex items-center justify-center'>

          <Image
            src={"/images/mau.png"}
            alt="Student"
            width={100}
            height={100}
          />
        </div>

        <div className="text-center mb-12">

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student ID Generation and Verification System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure and efficient student identification using QR code technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Register and manage student records</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/students">
                <Button className="w-full bg-[#e56717]">Manage Students</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <QrCode className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>Scan student QR codes for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/verify">
                <Button className="w-full" variant="outline">Scan QR Code</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Manual Verification</CardTitle>
              <CardDescription>Verify students manually by ID</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/verify/manual">
                <Button className="w-full" variant="outline">Manual Verify</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-orange-600 mb-2" />
              <CardTitle>Verification Logs</CardTitle>
              <CardDescription>View verification history and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/logs">
                <Button className="w-full" variant="outline">View Logs</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Register Students</h3>
              <p className="text-gray-600">Add student information and generate unique QR codes</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Scan QR Codes</h3>
              <p className="text-gray-600">Use the scanner to quickly verify student identity</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Track Verification</h3>
              <p className="text-gray-600">Monitor and log all verification activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
