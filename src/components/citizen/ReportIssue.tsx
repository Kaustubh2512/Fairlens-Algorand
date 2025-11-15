import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  MapPin,
} from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";

export default function ReportIssue() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState("");

  const myReports = [
    {
      id: "RPT-001",
      title: "Poor quality materials at Highway project",
      category: "Quality",
      project: "Highway Construction - NH47",
      status: "Under Review",
      date: "2025-10-20",
      response: null,
    },
    {
      id: "RPT-002",
      title: "Project delay without proper communication",
      category: "Delay",
      project: "School Renovation",
      status: "Resolved",
      date: "2025-10-15",
      response:
        "Contractor has provided explanation. Timeline updated.",
    },
    {
      id: "RPT-003",
      title: "Safety concerns at construction site",
      category: "Safety",
      project: "Bridge Construction",
      status: "In Progress",
      date: "2025-10-18",
      response: "Site inspection scheduled for next week.",
    },
  ];

  const handleSubmitReport = () => {
    toast.success("Report submitted successfully!", {
      description:
        "Your report has been recorded and will be reviewed shortly.",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "Resolved") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    }
    if (status === "In Progress") {
      return (
        <Badge className="bg-blue-500">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500">
        <AlertCircle className="h-3 w-3 mr-1" />
        Under Review
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">
            Submit New Report
          </TabsTrigger>
          <TabsTrigger value="my-reports">
            My Reports ({myReports.length})
          </TabsTrigger>
          <TabsTrigger value="guidelines">
            Reporting Guidelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Report an Issue</CardTitle>
              <CardDescription>
                Help improve transparency by reporting issues
                related to public infrastructure projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Anonymous Reporting */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex-1">
                    <Label
                      htmlFor="anonymous"
                      className="text-base"
                    >
                      Anonymous Reporting
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Your identity will not be disclosed to
                      anyone
                    </p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                {/* Personal Details (if not anonymous) */}
                {!isAnonymous && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                )}

                {/* Report Details */}
                <div>
                  <Label htmlFor="project">
                    Select Project
                  </Label>
                  <Select>
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prj1">
                        Highway Construction - NH47
                      </SelectItem>
                      <SelectItem value="prj2">
                        School Renovation
                      </SelectItem>
                      <SelectItem value="prj3">
                        Bridge Construction
                      </SelectItem>
                      <SelectItem value="prj4">
                        Water Pipeline Network
                      </SelectItem>
                      <SelectItem value="other">
                        Other / Not Listed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">
                    Issue Category
                  </Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corruption">
                        Corruption / Bribery
                      </SelectItem>
                      <SelectItem value="quality">
                        Poor Quality Work
                      </SelectItem>
                      <SelectItem value="delay">
                        Project Delays
                      </SelectItem>
                      <SelectItem value="safety">
                        Safety Concerns
                      </SelectItem>
                      <SelectItem value="environmental">
                        Environmental Issues
                      </SelectItem>
                      <SelectItem value="budget">
                        Budget Misuse
                      </SelectItem>
                      <SelectItem value="other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide as much detail as possible about the issue..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="location">
                    Location / Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="location"
                      placeholder="Specific location of the issue"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label>Upload Evidence (Photos/Videos)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Photos, videos, or documents (max 50MB)
                    </p>
                    <Button variant="outline" className="mt-4">
                      Select Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ✓ All uploads will be encrypted and
                    geotagged for verification
                  </p>
                </div>

                {/* Submission Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm mb-2">
                    What happens after submission?
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>
                      • Your report is recorded on blockchain
                      for transparency
                    </li>
                    <li>
                      • Government officials will review within
                      48 hours
                    </li>
                    <li>
                      • You'll receive updates on the status of
                      your report
                    </li>
                    <li>
                      • Serious issues are escalated immediately
                    </li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={handleSubmitReport}
                    type="button"
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-reports">
          <div className="space-y-4">
            {myReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {report.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {report.id} • {report.project}
                      </CardDescription>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Category:
                      </span>
                      <Badge variant="outline">
                        {report.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Submitted:
                      </span>
                      <span>{report.date}</span>
                    </div>
                    {report.response && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm">
                              <strong>
                                Official Response:
                              </strong>
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {report.response}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      View Full Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle>Reporting Guidelines</CardTitle>
              <CardDescription>
                How to effectively report issues and what to
                expect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg mb-3">
                  What Can You Report?
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">
                      •
                    </span>
                    <span>
                      <strong>Corruption or Bribery:</strong>{" "}
                      Any instances of corruption, kickbacks, or
                      bribery
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">
                      •
                    </span>
                    <span>
                      <strong>Quality Issues:</strong> Poor
                      quality materials or workmanship
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">
                      •
                    </span>
                    <span>
                      <strong>Project Delays:</strong>{" "}
                      Unexplained delays or timeline deviations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">
                      •
                    </span>
                    <span>
                      <strong>Safety Concerns:</strong> Unsafe
                      working conditions or public safety risks
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">
                      •
                    </span>
                    <span>
                      <strong>Budget Misuse:</strong> Suspected
                      misappropriation of funds
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-3">Best Practices</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Provide specific details: dates, times,
                      locations, and names if possible
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Include photo or video evidence when
                      available
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Be objective and factual - avoid
                      speculation
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Use anonymous reporting if you have safety
                      concerns
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-3">
                  Response Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span>24h</span>
                    </div>
                    <div>
                      <p className="text-sm">
                        Initial acknowledgment of your report
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                      <span>48h</span>
                    </div>
                    <div>
                      <p className="text-sm">
                        Review and categorization by officials
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <span>7d</span>
                    </div>
                    <div>
                      <p className="text-sm">
                        Investigation and preliminary response
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm mb-2">
                  Your Protection
                </h4>
                <p className="text-sm text-gray-700">
                  FAIRLENS is committed to protecting
                  whistleblowers. All reports are treated
                  confidentially, and anonymous reporting
                  ensures your identity is never disclosed. Your
                  contribution helps maintain transparency and
                  accountability in public infrastructure
                  projects.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}