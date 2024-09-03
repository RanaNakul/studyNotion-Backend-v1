const Agenda = require('agenda');
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path to your User model
const Profile = require('../models/Profile'); // Adjust the path to your Profile model
const Course = require('../models/Course'); // Adjust the path to your Course model

const mongoConnectionString = 'mongodb+srv://nakulrana2601:hdx8MnPp2KeeKUEa@cluster55.cngi46b.mongodb.net/StudyNotionDB'; // Replace with your MongoDB connection string

const agenda = new Agenda({ db: { address: mongoConnectionString, collection: 'agendaJobs' } });

agenda.define('delete user account', async (job, done) => {
    const { userId } = job.attrs.data;

    try {
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            console.log(`User not found: ${userId}`);
            return done();
        }

        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        for (let courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(courseId, {
                $pull: { studentsEnrolled: userId }
            }, { new: true });
        }

        await User.findByIdAndDelete(userId);

        console.log(`Account for user ${userId} deleted successfully.`);

        // Remove the job from the agendaJobs collection
        await job.remove();
        
        done();
    } catch (error) {
        console.error(`Failed to delete account for user ${userId}:`, error.message);
        done(error);
    }
});

(async function() {
    await agenda.start();
})();

module.exports = agenda;
