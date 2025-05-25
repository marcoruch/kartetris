import { Collection, MongoClient } from "mongodb";
import { RankingEntry } from "../../../../shared/types";
import { ScoreDocument } from "../schemas/scores";

/**
 * Retrieves the scores collection from the database.
 * @param client MongoDB client
 * @description Returns a collection of scores from the database.
 * @returns {Collection<Document>} Collection of scores.
 */
export const useScoresCollection = (client: MongoClient): Collection<ScoreDocument> => {
  return client.db().collection<ScoreDocument>("scores");
}

/**
 * Retrive the top 10 scores + name from the scores collection.
 * @param client MongoDB client
 * @returns 
 */
export const retrieveTop10Scores = async (client: MongoClient): Promise<RankingEntry[]> => {
  const collection = useScoresCollection(client);
  return await collection.find({}).sort({ score: -1 }).limit(10).toArray()
    .then((scores) => {
      return scores.map((score) => ({
        playerName: score.playerName,
        score: score.score
      }));
    })
    .catch((error) => {
      console.error("Error retrieving top 10 scores:", error);
      return [];
    });
}

/**
 * Update the scores of both the winner and loser in a single operation.
 * @param client MongoDB client
 * @param winnerName Name of the winner
 * @param winnerScore Score to increase for the winner
 * @param loserName Name of the loser
 * @param loserScore Score to increase for the loser
 */
export const updateScores = async (
  client: MongoClient,
  winnerName: string,
  winnerScore: number,
  loserName: string,
  loserScore: number
): Promise<void> => {
  const collection = useScoresCollection(client);

  await collection.bulkWrite([
    {
      updateOne: {
        filter: { playerName: winnerName },
        update: { $inc: { score: winnerScore } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { playerName: loserName },
        update: { $inc: { score: loserScore } },
        upsert: true,
      },
    },
  ]);
};