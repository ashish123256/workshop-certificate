export interface Workshop {
    id: string;
    adminId: string;
    collegeName: string;
    workshopName: string;
    date: string;
    time: string;
    instructions: string;
    isActive: boolean;
    uniqueLink: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface Submission {
    id: string;
    workshopId: string;
    name: string;
    course: string;
    phone: string;
    email: string;
    feedback: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    certificateUrl?: string;
    submittedAt: Date;
  }
  
  export interface CertificateTemplate {
    id: string;
    name: string;
    url: string;
    createdAt: Date;
    isActive: boolean;
  }
  
  export interface AnalyticsData {
    totalWorkshops: number;
    activeWorkshops: number;
    totalSubmissions: number;
    completionRate: number;
    submissionsByWorkshop: Array<{
      workshopId: string;
      workshopName: string;
      count: number;
    }>;
  }