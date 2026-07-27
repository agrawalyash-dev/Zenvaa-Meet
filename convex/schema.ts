import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  calls: defineTable({
    callCode: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("connected"),
      v.literal("ended"),
    ),
    callerOffer: v.string(),
    calleeAnswer: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_callCode", ["callCode"]),

  iceCandidates: defineTable({
    callCode: v.string(),
    from: v.union(v.literal("caller"), v.literal("callee")),
    candidate: v.string(),
    createdAt: v.number(),
  }).index("by_callCode", ["callCode"]),
});
