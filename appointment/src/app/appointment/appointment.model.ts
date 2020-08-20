export class Appointment {
  constructor(
    public _id: string,
    public madeBy: string,
    public name: string,
    public clinic: string,
    public bookedDate: Date,
    public time: string,
    public appointmentType?: string,
    public insurance?: string,
    public done?: string,
    public contact?: string,
    public response?: string,
    public remarks?: string,
    public editor?: string,
    public reason?: string
  ) {}
}
