"use client";

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import useTournamentStore from '@/store/useTournamentStore';

const sports = [
  "Badminton"
];

const badmintonEvents = [
  "Men's Singles",
  "Women's Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Mixed Doubles"
];

const badmintonTournamentTypes = [
  "Knockout Tournament (Single Elimination)",
  "League Tournament (Round Robin)",
  "Knockout-Cum-League Tournament",
  "League-Cum-Knockout Tournament",
  "Challenge Tournament",
  "Swiss League System",
  "Consolation Tournament"
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const { createTournament, isLoading, isError, message } = useTournamentStore();

  const [formData, setFormData] = useState({
      title: '',
      game: 'Badminton',
      format: 'Knockout Tournament (Single Elimination)',
      event: '', // For badminton events
      startDate: '',
      maxParticipants: 16
  });

  const { title, game, format, event, startDate, maxParticipants } = formData;

  const onChange = (e) => {
      setFormData((prevState) => ({
          ...prevState,
          [e.target.name]: e.target.value,
      }));
  };

  const onSubmit = async (e) => {
      e.preventDefault();
      
      const newTournament = await createTournament(formData);
      
      if (newTournament) {
          router.push(`/dashboard/tournaments/${newTournament._id}`);
      }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
        <p className="text-text-muted mt-2">Set up your new league or cup event.</p>
      </div>
      
      {isError && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {message}
          </div>
      )}

      <Card className="p-8">
        <form className="space-y-8" onSubmit={onSubmit}>
          {/* Tournament Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-white/5 pb-2">Details</h2>
            
            <Input 
                label="Tournament Name" 
                name="title"
                value={title}
                onChange={onChange}
                placeholder="Ex: Winter Championship 2024" 
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Game / Sport</label>
                  <select 
                    name="game"
                    value={game}
                    onChange={onChange}
                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-text-muted/50"
                    required
                    disabled
                  >
                    <option value="Badminton">Badminton</option>
                  </select>
               </div>

            {/* Badminton Event Selection */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Badminton Event</label>
                <select 
                  name="event"
                  value={event}
                  onChange={onChange}
                  className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-text-muted/50"
                  required
                >
                  <option value="" disabled>Select an event</option>
                  {badmintonEvents.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
             </div>
             
             {/* Tournament Format */}
             <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">
                    Tournament Type
                  </label>
                  <select 
                    name="format"
                    value={format}
                    onChange={onChange}
                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-text-muted/50"
                  >
                      {badmintonTournamentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                  </select>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Start Date" 
                    name="startDate"
                    value={startDate}
                    onChange={onChange}
                    type="date" 
                />
                 <Input 
                    label="Max Teams" 
                    name="maxParticipants"
                    value={maxParticipants}
                    onChange={onChange}
                    type="number" 
                    placeholder="16"
                />
            </div>
          </section>

          <div className="pt-4 flex items-center justify-end gap-4">
             <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
             <Button disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Tournament'}
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
