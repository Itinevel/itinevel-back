import { Request, Response } from 'express';
import Itinerary from '../models/ItineraryDetailsModel'; // Mongoose model for itineraries
import prisma from '../config/database'; // Prisma client for PostgreSQL
import { ParsedQs } from 'qs';


export class PlanController {
  async createPlan(req: Request, res: Response): Promise<Response> { // Change void to Response
    try {
      const { plan, itineraries } = req.body;
      const userId = plan.userId; 

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required to create a plan' });
      }

      let itineraryIds: string[] = [];

      for (const itineraryData of itineraries) {
        const newItinerary = new Itinerary(itineraryData);
        const savedItinerary = await newItinerary.save();
        itineraryIds.push(savedItinerary._id.toString());
      }

      // Create the plan in PostgreSQL and include the 'sell' status
      const newPlan = await prisma.plan.create({
        data: {
          name: plan.name,
          description: plan.description,
          totalDays: itineraryIds.length,
          itineraries: itineraryIds,
          imageUrls: plan.imageUrls,
          selectedCountries: plan.selectedCountries,
          totalPrice: plan.totalPrice,
          totalCost: plan.totalCost,
          sell: plan.sell,
          userId: userId,  // Include the sell status
        },
      });
      await prisma.users.update({
        where: { id: userId },
        data: {
          plans: {
            connect: { id: newPlan.id }, // Connect the new plan to the user
          },
        },
      });

      return res.status(201).json({ message: "Plan created successfully", newPlan }); // Returning Response
    } catch (error) {
      console.error('Error creating plan:', (error as Error).message);
      return res.status(500).json({ message: 'Failed to create plan', error: (error as Error).message }); // Return Response here as well
    }
  }
  
  
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const {
        sortOption = 'name', 
        isAscending = 'true', 
        searchQuery = '', 
        budgetRange = ['0', '1000000'],  // Cast budgetRange as a string array
        daysRange = ['1', '30'],         // Cast daysRange as a string array
        selectedCountries = [], 
        selectedAccommodations = [], 
        selectedSeasons = [],
        sell = 'true',  // Default to 'false' if not provided
      } = req.query;
  
      // Function to ensure the query is properly cast to string[]
      const castToStringArray = (param: string | ParsedQs | string[] | ParsedQs[]): string[] => {
        if (Array.isArray(param)) {
          return param.map(String); // Ensure all elements are cast to strings
        }
        return [String(param)];
      };
  
      const budgetRangeParsed: number[] = Array.isArray(budgetRange)
        ? budgetRange.map(Number)
        : [Number(budgetRange)];
  
      const daysRangeParsed: number[] = Array.isArray(daysRange)
        ? daysRange.map(Number)
        : [Number(daysRange)];
  
      const selectedCountriesParsed: string[] = castToStringArray(selectedCountries);
      const selectedAccommodationsParsed: string[] = castToStringArray(selectedAccommodations);
      const selectedSeasonsParsed: string[] = castToStringArray(selectedSeasons);
  
      // Build filter conditions for Prisma query
      const filterConditions: any = {};
  
      // Apply sell filter
      if (sell) {
        filterConditions.sell = sell === 'true';  // Convert the 'sell' string to a boolean
      }
  
      // Search query filtering
      if (searchQuery) {
        filterConditions.OR = [
          { name: { contains: String(searchQuery), mode: 'insensitive' } },
          { description: { contains: String(searchQuery), mode: 'insensitive' } }
        ];
      }
  
      // Budget range filtering
      if (budgetRangeParsed.length === 2) {
        filterConditions.totalPrice = {
          gte: budgetRangeParsed[0],
          lte: budgetRangeParsed[1],
        };
      }
  
      // Days range filtering
      if (daysRangeParsed.length === 2) {
        filterConditions.totalDays = {
          gte: daysRangeParsed[0],
          lte: daysRangeParsed[1],
        };
      }
  
      // Country filtering (if provided)
      if (selectedCountriesParsed.length > 0) {
        filterConditions.selectedCountries = { hasSome: selectedCountriesParsed };
      }
  
      // Accommodation filtering (optional field in Plan model)
      if (selectedAccommodationsParsed.length > 0) {
        filterConditions.accommodation = { hasSome: selectedAccommodationsParsed };
      }
  
      // Season filtering (optional field in Plan model)
      if (selectedSeasonsParsed.length > 0) {
        filterConditions.season = { hasSome: selectedSeasonsParsed };
      }
  
      // Determine sorting order
      const sortCondition: any = {};
      sortCondition[String(sortOption)] = isAscending === 'true' ? 'asc' : 'desc';
  
      // Fetch plans from the database with filtering and sorting
      const plans = await prisma.plan.findMany({
        where: filterConditions,
        orderBy: sortCondition,
      });
  
      res.status(200).json(plans);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching plans:', error.message);
        res.status(500).json({ message: 'Failed to fetch plans', error: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: "An unexpected error occurred", error: 'Unknown error' });
      }
    }
  }
  

  async getPlanWithItineraries(req: Request, res: Response): Promise<void> {
    try {
      const { planId } = req.params;

      const plan = await prisma.plan.findUnique({
        where: {
          id: parseInt(planId),
        }
      });

      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      const itineraryDetails = await Promise.all(
        plan.itineraries.map(itineraryId => 
          Itinerary.findById(itineraryId).catch(() => null)
        )
      );

      const validItineraries = itineraryDetails.filter(itinerary => itinerary !== null);

      res.status(200).json({
        plan,
        itineraries: validItineraries
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error retrieving plan and itineraries:', error.message);
        res.status(500).json({ message: 'Failed to retrieve plan and itineraries', error: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: "An unexpected error occurred", error: 'Unknown error' });
      }
    }
  }

  async updatePlan(req: Request, res: Response): Promise<Response> {
    try {
      const { planId } = req.params;
      const { plan, itineraries } = req.body;
  
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
  
      // Update existing itineraries
      let itineraryIds: string[] = [];
      for (const itineraryData of itineraries) {
        // If the itineraryData is a string, it is an existing ID, so just push the ID
        if (typeof itineraryData === 'string') {
          itineraryIds.push(itineraryData);
        } else if (typeof itineraryData === 'object' && itineraryData._id) {
          // If it's an object with _id, update the existing itinerary
          await Itinerary.findByIdAndUpdate(itineraryData._id, itineraryData);
          itineraryIds.push(itineraryData._id);
        } else if (typeof itineraryData === 'object') {
          // If it's a new object, create a new itinerary
          const newItinerary = new Itinerary(itineraryData);
          const savedItinerary = await newItinerary.save();
          itineraryIds.push(savedItinerary._id.toString());
        } else {
          console.error("Invalid itinerary data: Expected an object but got", itineraryData);
          throw new Error("Invalid itinerary data: Must be an object or string.");
        }
      }
  
      // Update the plan in PostgreSQL, including the 'sell' status
      const updatedPlan = await prisma.plan.update({
        where: { id: parseInt(planId) },
        data: {
          name: plan.name,
          description: plan.description,
          itineraries: itineraryIds,  // Ensure this is an array of valid IDs
          imageUrls: plan.imageUrls,
          selectedCountries: plan.selectedCountries,
          totalPrice: plan.totalPrice,
          totalCost: plan.totalCost,
          sell: plan.sell,
        },
      });
  
      return res.status(200).json({ message: "Plan updated successfully", updatedPlan });
    } catch (error) {
      console.error('Error updating plan:', (error as Error).message);
      return res.status(500).json({ message: 'Failed to update plan', error: (error as Error).message });
    }
  }
  

  
 
  
  
}
