"use client";

import { toggleLikeThread } from '@/lib/actions/thread.actions';
import Image from 'next/image';
import React, { useState } from 'react'

interface LikeThreadProps {
  isLiked: boolean;
  threadId: string;
  userId: string;
  path: string;
  likeCount: number;
}

const LikeThread = ({isLiked, threadId, userId, likeCount = 0 , path}: LikeThreadProps) => {
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [likes, setLikes] = useState<number>(likeCount);

  const toggleHeart = async () => {
    const result = await toggleLikeThread(threadId, userId, path);
    if(result == undefined) return console.log('error');
    setLiked(result.isLiked);
    setLikes(result.likes);
  }
  return (
    <div className='flex items-center justify-start gap-1 text-light-4'>
      <Image src={liked?'/assets/heart-filled.svg': '/assets/heart-gray.svg'} alt='heart' width={24} height={24} className='cursor-pointer object-contain' onClick={toggleHeart}/>
      {likes>0 && likes}
    </div>
  )
}

export default LikeThread