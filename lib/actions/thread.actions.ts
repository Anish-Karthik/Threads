"use server"

import Thread from "@/lib/models/thread.model";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";
import Community from "@/lib/models/community.model";

interface ThreadProps {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
interface addCommentToThreadProps {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}


export async function createThread({ text, author, communityId, path}: ThreadProps) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject._id ?? null, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }
    // make sure channges are reflected in the cache immediately
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();
    //  calc skips
    const skipAmount = (pageNumber - 1) * pageSize;

    // top level threads
    const threadsQuery = await Thread.find({parentId: { $in: [null, undefined] }})
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({path: "author", model: "User"})
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: "User",
          select: "_id name parentId image",
        },
      })
      .exec();
    const posts = threadsQuery;
    
    const totalThreadsCount = await Thread.countDocuments({parentId: { $in: [null, undefined] }});


    const isNext = totalThreadsCount > skipAmount + posts.length;

    return {posts, isNext};

  } catch (error) {
    
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();

    // TODO: populate Commmunity
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: "User", 
        select: "_id id name image"
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: "User",
            select: "_id id name parentId image"
          },
          {
            path: "children",
            model: "Thread",
            populate: {
              path: "author",
              model: "User",
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();

    return thread;
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: addCommentToThreadProps) {
  try {
    connectToDB();

    const originalThread = await Thread.findById(threadId);

    if(!originalThread) {
      throw new Error("Thread not found");
    }
    
    // create a new thread with the comment text
    const newComment = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await newComment.save();

    // add the new thread to the original thread's children
    originalThread.children.push(savedCommentThread._id);

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }

}