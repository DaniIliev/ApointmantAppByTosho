"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, User, Phone, Mail, Plus, Search, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AppointmentStatus = "upcoming" | "completed" | "cancelled"

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  time: string
  service: string
  status: AppointmentStatus
  notes?: string
}

interface AppointmentType {
  id: string
  name: string
  description: string
  duration: number
  price: number
  color: string
}

const mockAppointmentTypes: AppointmentType[] = [
  {
    id: "1",
    name: "Business Consultation",
    description: "Strategic business planning and consultation",
    duration: 60,
    price: 150,
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "2",
    name: "Strategy Session",
    description: "Deep dive into business strategy and planning",
    duration: 90,
    price: 200,
    color: "from-green-500 to-teal-500",
  },
  {
    id: "3",
    name: "Follow-up Meeting",
    description: "Progress review and next steps discussion",
    duration: 30,
    price: 75,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "4",
    name: "Project Review",
    description: "Comprehensive project evaluation and feedback",
    duration: 45,
    price: 100,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "5",
    name: "Initial Consultation",
    description: "First meeting to understand client needs",
    duration: 60,
    price: 120,
    color: "from-cyan-500 to-blue-500",
  },
]

const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    clientPhone: "+1 (555) 123-4567",
    date: "2024-01-15",
    time: "10:00 AM",
    service: "Business Consultation",
    status: "upcoming",
    notes: "First-time client, interested in digital marketing",
  },
  {
    id: "2",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "3",
    clientName: "Emily Davis",
    clientEmail: "emily@example.com",
    clientPhone: "+1 (555) 456-7890",
    date: "2024-01-14",
    time: "11:00 AM",
    service: "Follow-up Meeting",
    status: "completed",
  },
  {
    id: "4",
    clientName: "Robert Wilson",
    clientEmail: "robert@example.com",
    clientPhone: "+1 (555) 321-0987",
    date: "2024-01-13",
    time: "3:00 PM",
    service: "Project Review",
    status: "cancelled",
  },
  {
    id: "5",
    clientName: "Lisa Anderson",
    clientEmail: "lisa@example.com",
    clientPhone: "+1 (555) 111-2222",
    date: "2024-01-16",
    time: "9:00 AM",
    service: "Initial Consultation",
    status: "upcoming",
  },
  {
    id: "6",
    clientName: "David Brown",
    clientEmail: "david@example.com",
    clientPhone: "+1 (555) 333-4444",
    date: "2024-01-17",
    time: "1:00 PM",
    service: "Project Planning",
    status: "upcoming",
  },
]

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dateInput, setDateInput] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    date: "",
    time: "",
    appointmentTypeId: "",
    notes: "",
  })

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-primary to-accent text-white"
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(date.getDate() - day)

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek)
      weekDate.setDate(startOfWeek.getDate() + i)
      week.push(weekDate)
    }
    return week
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return appointments.filter((apt) => apt.date === dateString)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setDate(prev.getDate() + 7)
      }
      return newDate
    })
  }

  const navigateToDate = () => {
    if (dateInput) {
      const newDate = new Date(dateInput)
      if (!isNaN(newDate.getTime())) {
        setCurrentDate(newDate)
        setDateInput("")
      }
    }
  }

  const renderCalendar = () => {
    const weekDates = getWeekDates(currentDate)
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    return (
      <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Week of {monthNames[weekDates[0].getMonth()]} {weekDates[0].getDate()}, {weekDates[0].getFullYear()}
            </h2>
            <div className="flex gap-2 items-center">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  placeholder="YYYY-MM-DD"
                />
                <Button variant="outline" size="sm" onClick={navigateToDate} className="rounded-xl bg-transparent">
                  Go
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
                className="rounded-xl bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("next")}
                className="rounded-xl bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, index) => {
              const date = weekDates[index]
              const dayAppointments = getAppointmentsForDate(date)
              const isToday = new Date().toDateString() === date.toDateString()

              return (
                <div key={dayName} className="space-y-2">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-muted-foreground">{dayName}</div>
                    <div className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {date.getDate()}
                    </div>
                  </div>

                  <div
                    className={`min-h-[200px] p-3 border-2 rounded-lg bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-200 ${
                      isToday ? "ring-2 ring-primary border-primary/30" : "border-primary/10"
                    }`}
                  >
                    <div className="space-y-2">
                      {dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => openAppointmentModal(apt)}
                          className={`text-xs p-2 rounded cursor-pointer hover:scale-105 transition-transform ${getStatusColor(apt.status)}`}
                        >
                          <div className="font-medium">{apt.time}</div>
                          <div className="truncate">{apt.clientName}</div>
                          <div className="truncate opacity-80">{apt.service}</div>
                        </div>
                      ))}
                      {dayAppointments.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-4">No appointments</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const openAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  const handleCreateAppointment = () => {
    const selectedType = mockAppointmentTypes.find((type) => type.id === newAppointment.appointmentTypeId)
    if (!selectedType) return

    const appointment: Appointment = {
      id: Date.now().toString(),
      clientName: newAppointment.clientName,
      clientEmail: newAppointment.clientEmail,
      clientPhone: newAppointment.clientPhone,
      date: newAppointment.date,
      time: newAppointment.time,
      service: selectedType.name,
      status: "upcoming",
      notes: newAppointment.notes,
    }

    setAppointments((prev) => [...prev, appointment])
    setIsCreateModalOpen(false)
    setNewAppointment({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      date: "",
      time: "",
      appointmentTypeId: "",
      notes: "",
    })
  }

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((a) => a.status === "upcoming").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-accent/40 to-primary/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            Appointment Dashboard
          </h1>
          <p className="text-xl text-muted-foreground font-medium">Manage and track all your appointments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stats.total}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-3xl font-bold text-primary">{stats.upcoming}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                  <p className="text-3xl font-bold text-red-500">{stats.cancelled}</p>
                </div>
                <User className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {renderCalendar()}

        <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-10 h-12 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    className="rounded-xl"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "upcoming" ? "default" : "outline"}
                    onClick={() => setStatusFilter("upcoming")}
                    className="rounded-xl"
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={statusFilter === "completed" ? "default" : "outline"}
                    onClick={() => setStatusFilter("completed")}
                    className="rounded-xl"
                  >
                    Completed
                  </Button>
                  <Button
                    variant={statusFilter === "cancelled" ? "default" : "outline"}
                    onClick={() => setStatusFilter("cancelled")}
                    className="rounded-xl"
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20 hover:shadow-3xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">{appointment.clientName}</h3>
                      <Badge className={`${getStatusColor(appointment.status)} px-3 py-1 rounded-full font-semibold`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {appointment.clientEmail}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {appointment.clientPhone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-primary">{appointment.service}</p>
                      {appointment.notes && <p className="text-sm text-muted-foreground italic">{appointment.notes}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
            <CardContent className="p-12 text-center">
              <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No appointments found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-lg border-2 border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Appointment Details
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedAppointment.clientName}</h3>
                <Badge className={`${getStatusColor(selectedAppointment.status)} px-3 py-1 rounded-full font-semibold`}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>{selectedAppointment.clientEmail}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>{selectedAppointment.clientPhone}</span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <span>{new Date(selectedAppointment.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{selectedAppointment.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Service</h4>
                <p>{selectedAppointment.service}</p>
              </div>

              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Notes</h4>
                  <p className="text-muted-foreground italic">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl">
                  Edit Appointment
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl bg-transparent">
                  Contact Client
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-lg border-2 border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Create New Appointment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm font-medium">
                  Client Name
                </Label>
                <Input
                  id="clientName"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment((prev) => ({ ...prev, clientName: e.target.value }))}
                  className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  placeholder="Enter client name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newAppointment.clientEmail}
                  onChange={(e) => setNewAppointment((prev) => ({ ...prev, clientEmail: e.target.value }))}
                  className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  placeholder="client@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="clientPhone"
                  value={newAppointment.clientPhone}
                  onChange={(e) => setNewAppointment((prev) => ({ ...prev, clientPhone: e.target.value }))}
                  className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentType" className="text-sm font-medium">
                  Appointment Type
                </Label>
                <Select
                  value={newAppointment.appointmentTypeId}
                  onValueChange={(value) => setNewAppointment((prev) => ({ ...prev, appointmentTypeId: value }))}
                >
                  <SelectTrigger className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl">
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-lg border-2 border-primary/20">
                    {mockAppointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id} className="focus:bg-primary/10">
                        <div className="flex flex-col">
                          <span className="font-medium">{type.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.duration}min - ${type.price}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment((prev) => ({ ...prev, time: e.target.value }))}
                  className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px] border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl resize-none"
                placeholder="Add any additional notes or special requirements..."
              />
            </div>

            {newAppointment.appointmentTypeId && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                {(() => {
                  const selectedType = mockAppointmentTypes.find((type) => type.id === newAppointment.appointmentTypeId)
                  return selectedType ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary">Selected Service</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{selectedType.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedType.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${selectedType.price}</p>
                          <p className="text-sm text-muted-foreground">{selectedType.duration} minutes</p>
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 rounded-xl bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAppointment}
                disabled={
                  !newAppointment.clientName ||
                  !newAppointment.clientEmail ||
                  !newAppointment.date ||
                  !newAppointment.time ||
                  !newAppointment.appointmentTypeId
                }
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
              >
                Create Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
