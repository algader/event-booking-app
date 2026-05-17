import React from 'react';
import { useQuery } from '@apollo/client/react';
import { EVENTS } from './queries';

export default function EventsPage() {
  function EventList() {
    const { loading, error, data } = useQuery(EVENTS);

    console.log({ data, loading });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    return data.events.map(({ _id, title, description }) => (
      <div key={_id}>
        <p>{title} : {description}</p>
      </div>
    ));
  }

  return (
    <EventList />
  );
}