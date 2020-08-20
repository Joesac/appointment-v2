export class User {
  constructor(
    public _id: string,
    public username: string,
    public password: string,
    public fullname: string,
    public role: string,
    public dateAdded?: Date,
    public reviews?: string[],
    public referrals?: string[],
    public clinic?: string
  ) {}
}
