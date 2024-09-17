import { Request, Response } from 'express';
import CollectedData from '../models/CollectedData'; // Adjust the import based on your actual file structure

export const getReports = async (req: Request, res: Response) => {
  try {
    // Fetch all collected data where `customerVerify` is true
    const verifiedData = await CollectedData.find({ customerVerify: "Accepted" })
      .populate('customerName', 'name address') // Populate customerName with name field
      .populate('salesman', 'name address'); // Populate salesman with name field

    if (verifiedData.length === 0) {
      return res.status(404).json({ message: 'Report Not found' });
    }

    res.status(200).json(verifiedData);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
