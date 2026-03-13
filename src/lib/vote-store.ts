import { create } from "zustand";

type VoteStore = {
  votes: Record<string, boolean>;
  mergeVotes: (votes: Record<string, boolean>) => void;
  setVote: (messageId: string, isUpvote: boolean) => void;
  removeVote: (messageId: string) => void;
};

export const useVoteStore = create<VoteStore>((set) => ({
  votes: {},
  mergeVotes: (votes) =>
    set((state) => ({ votes: { ...state.votes, ...votes } })),
  setVote: (messageId, isUpvote) =>
    set((state) => ({ votes: { ...state.votes, [messageId]: isUpvote } })),
  removeVote: (messageId) =>
    set((state) => {
      const { [messageId]: _removed, ...rest } = state.votes;
      return { votes: rest };
    }),
}));
