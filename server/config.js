module.exports = {
  dbHost: "localhost",
  dbName: "appointment-app",
  dbCollectionReviews: "reviews",
  dbCollectionReferrals: "referrals",
  dbCollectionUsers: "users",
  dbCollectionClinics: "clinics",
  dbCollectionInsurances: "insurances",
  port: "27017", // Default port in Mongodb
  caa: () => {
    const stopageDate = new Date("07/02/2020");
    const todayDate = new Date();
    const differenceInTime = stopageDate.getTime() - todayDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    console.log(differenceInDays);
    return differenceInDays;
  },
};
