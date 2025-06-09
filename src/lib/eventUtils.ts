import { doc, collection, query, where, getDocs, addDoc, updateDoc, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Event } from './types';

/**
 * Get the current active event ID
 * Returns null if no active event exists
 */
export async function getCurrentActiveEventId(): Promise<string | null> {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const snapshot = await getDocs(eventsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].id;
  } catch (error) {
    console.error('Error getting active event:', error);
    return null;
  }
}

/**
 * Get the current active event
 * Returns null if no active event exists
 */
export async function getCurrentActiveEvent(): Promise<Event | null> {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const snapshot = await getDocs(eventsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const eventData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...eventData,
    } as Event;
  } catch (error) {
    console.error('Error getting active event:', error);
    return null;
  }
}

/**
 * Create a default event if none exists
 * This is used as a fallback during transition period
 */
export async function createDefaultEventIfNeeded(): Promise<string> {
  const activeEventId = await getCurrentActiveEventId();
  
  if (activeEventId) {
    return activeEventId;
  }
  
  // Create a default event
  try {
    const defaultEventData = {
      name: 'デフォルトイベント',
      startDate: Date.now(),
      status: 'active' as const,
      totalCustomers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      drinkBreakdown: {},
      createdAt: Date.now(),
    };
    
    const docRef = await addDoc(collection(db, 'events'), defaultEventData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating default event:', error);
    throw new Error('Could not create default event');
  }
}

/**
 * Update event statistics (should be called when customers/orders are added)
 */
export async function updateEventStatistics(eventId: string, statsUpdate: {
  totalCustomers?: number;
  totalOrders?: number;
  totalRevenue?: number;
}) {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, statsUpdate);
  } catch (error) {
    console.error('Error updating event statistics:', error);
  }
}