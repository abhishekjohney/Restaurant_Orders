export interface GetDailyReportListsJD1 {
  Code: number;
  USSR: string;
  Usrtyp: string;
}
export interface GetDailyReportListsJD3 {
  TaxiVehNo: string;
}

export interface GetDailyReportListsJD2 {
  ItemId: number;
  ItemName: string;
}

export interface GetDailyReportListsJD4 {
  ActionType: number;
  CODE: number;
  Drpyn: boolean;
  Drpynint: number;
  ORGAUTOID: number;
  ORGCODE: number;
  RPT_FName: null | string; // Assuming RPT_FName can be null or a string
  RPT_Heading: string;
  RPT_ID: number;
  RPT_type: number;
  SLNO: number;
  SOCID: number;
  defyn: boolean;
  prtall: boolean;
}

export interface EmployeeData {
  EMPAUTOID: number;
  SOCID: number | null;
  ORGCODE: number;
  EMPID: number;
  EMPCODE: string;
  EmployeeSlNo: number;
  SalCode: number | null;
  Salutation: string | null;
  EmployeeName: string;
  FatherName: string;
  FatherOccupation: string | null;
  PrsAddress0: string;
  PrsAddress1: string;
  PrsAddress2: string;
  PrsDistCode: number | null;
  PrsDistrict: string;
  PrsStateCode: number | null;
  PrsState: string;
  PrsNatCode: number | null;
  PrsNation: string | null;
  PrsPIN: string;
  PayScale: string | null;
  PayscaleCode: number;
  Designation: string;
  DesigCode: number;
  Department: string;
  DepCode: number | null;
  TypeCode: number | null;
  EmployeeType: string;
  DateofBirth: string; // Assuming ISO 8601 date format
  Gender: string;
  DOFJOIN: string; // Assuming ISO 8601 date format
  DOFREJOIN: string | null;
  DispCode: number | null;
  ESIDispensary: string | null;
  PFAccountNo: string | null;
  PFDOFELG: string | null;
  Pfvolamt: number | null;
  ESIAccountNo: string | null;
  ESIDOFELG: string | null;
  PFYN: string | null;
  PFEPFYN: boolean;
  PFCPFYN: boolean;
  PFundYN: boolean;
  PFundStartDate: string | null;
  ESIYN: boolean;
  SalaryType: number;
  PerAddress0: string;
  PerAddress1: string;
  PerAddress2: string;
  PerDistCode: number | null;
  PerDISTRICT: string;
  PerStateCode: number | null;
  PerState: string;
  PerNatCode: number | null;
  PerNATIONALITY: string | null;
  PerPIN: string;
  PhoneNo: string;
  EmailAddress: string;
  BankCode: number | null;
  BankName: string | null;
  BankAccno: string | null;
  ModeOfPay: string | null;
  PANNo: string;
  ContractorYN: boolean;
  ContCode: number | null;
  ContractorName: string | null;
  ShiftCode: number | null;
  ShiftName: string | null;
  YearsOfService: number | null;
  Grade: string | null;
  Qualification: string;
  DOFIncr: string | null;
  Referance1: string;
  Referance2: string | null;
  Remarks: string;
  DOFLeaving: string | null;
  OTAPPYN: boolean;
  OTEMPYN: boolean;
  OTRate: number;
  OTTimes: number;
  OTHourPay: number;
  OTdaypay: number;
  TDSCATEGORY: string | null;
  MaritalStatus: string | null;
  MOBILENO: string;
  PFHIGHEREPF: boolean;
  PFHIGHEREPS: boolean;
  EMPLOYEEDISABLED: boolean;
  BANKBRANCH: string | null;
  EMPLOYEECATEGORY: string | null;
  EMPCLASS: string | null;
  EMPSECTION: string | null;
  MOTHERNAME: string | null;
  MSTATUS: string | null;
  WID: boolean;
  SPOUSEOCC: string | null;
  SPOUSEPHONE: string | null;
  SKILLS: string | null;
  Experience: string | null;
  IntDate: string | null;
  PeriodOfempl: string | null;
  lastschool: string | null;
  reasnolast: string | null;
  howdid: string | null;
  whatdo: string | null;
  commitment: string | null;
  ORGAUTOID: number; // Duplicate property, consider removing
  EMPIdentity: string;
  PFHusFlag: string | null;
  DRPYN: boolean;
  USERID: number;
  PPNo: string | null;
  PPlaceOfIssue: string | null;
  PPIssueDate: string | null;
  PPExpiryDate: string | null;
  VisaNo: string | null;
  VIsaPlaceOfIssue: string | null;
  VisaIssueDate: string | null;
  VisaExpiryDate: string | null;
  HonoursOrAwards: string | null;
  SportsDetails: string | null;
  LiteracyDetails: string | null;
  DramaticsDetails: string | null;
  MusicOrDanceDetails: string | null;
  OtherActivity: string | null;
  DateOfProbation: string | null;
  DateOfConfirmation: string | null;
  DateofDeath: string | null;
  PayrollYN: string | null;
  Height: number | null;
  Weight: number | null;
  SPName: string | null;
  SPSQualification: string | null;
  SPSDob: string | null;
  SPEmployerDetails: string | null;
  SubTaught: string | null;
  SplDuties: string | null;
  MTNG: string | null;
  Religion: string | null;
  Community: string | null;
  Category: string | null;
  BG: string | null;
  PayGroup: string | null;
  UAN: string | null;
  APPNATURE: string | null;
  ADHARNO: string;
  BasicRate: number;
  WorkType: string | null;
}

export interface EmployeeDetails {
  EMPCode: string;
  EmpName: string;
  EMPAUTOID: number;
}
