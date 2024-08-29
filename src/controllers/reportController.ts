import { Request, Response } from 'express';
import CollectedData from '../models/CollectedData';
import { IUser } from '../models/User';

export const getReports = async (req: Request, res: Response) => {
  try {
    const { salesmanId, startDate, endDate } = req.query as {
      salesmanId?: string;
      startDate?: string;
      endDate?: string;
    };

    // Build the query
    const query: any = {};

    if (salesmanId) {
      query.salesman = salesmanId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = {
        $gte: new Date(startDate),
      };
    } else if (endDate) {
      query.date = {
        $lte: new Date(endDate),
      };
    }

    // Fetch collected data and populate fields
    const collectedData = await CollectedData.find(query)
      .populate({
        path: 'salesman',
        select: 'name', // Only include the 'name' field for salesman
      })
      .populate({
        path: 'customerName', // Populate the customerName field
        select: 'name', // Only include the 'name' field for customer
      });

    // Calculate totals and group by date
    const totalAmount = collectedData.reduce((sum, data) => sum + data.amount, 0);
    
    // Group by date
    const groupedByDate = collectedData.reduce((acc: any, data) => {
      const dateKey = data.date.toISOString().split('T')[0]; // Format the date to YYYY-MM-DD
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        amount: data.amount,
        // customerName: data.customerName.name, // Show only the name of the customer
        // salesman: data.salesman.name // Show only the name of the salesman
      });
      return acc;
    }, {});

    res.json({
      groupedByDate,
      totalAmount
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
