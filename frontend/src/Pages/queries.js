import { gql } from "@apollo/client";

export const EVENTS = gql`
  query Events {
    events{
      _id
      title
      description
      price
      date
      creator {
        _id
        username
      }
    }
  }
`;