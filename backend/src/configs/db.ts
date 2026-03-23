import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            console.error("MONGO_URI is not defined in .env file");
            process.exit(1);
        }

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);

        console.log(`Database: ${conn.connection.name}`);

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Connection Error: ${error.message}`);
        } else {
            console.error("An unknown error occurred while connecting to MongoDB");
        }
        process.exit(1);
    }
};

export default connectDB;