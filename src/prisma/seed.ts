import { AttachmentType, ConversationType, MediaType, MessageType, PostType } from "@prisma/client";
import { prisma } from "../lib/prisma/prisma.js";

async function main() {
  await prisma.messageRead.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.view.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.share.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.repost.deleteMany();
  await prisma.like.deleteMany();
  await prisma.media.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const password = "$2b$10$3X6/P014x8Cni6LH8HjUC.CZlMYrMdFHTvP15CRdtBrgjkdv/70Ey";

  const users = await Promise.all([
    prisma.user.create({data:{username:"nishidh",firstname:"Nishidh",lastname:"Singh",phone_number:"9999999990",email:"nishidh@example.com",hash_pass:password,DOB:new Date("2002-01-01"),image_url:"https://i.pravatar.cc/150?img=1"}}),
    prisma.user.create({data:{username:"john",firstname:"John",lastname:"Doe",phone_number:"9999999991",email:"john@example.com",hash_pass:password,DOB:new Date("2000-02-01"),image_url:"https://i.pravatar.cc/150?img=2"}}),
    prisma.user.create({data:{username:"alice",firstname:"Alice",lastname:"Johnson",phone_number:"9999999992",email:"alice@example.com",hash_pass:password,DOB:new Date("2001-03-01"),image_url:"https://i.pravatar.cc/150?img=3"}}),
    prisma.user.create({data:{username:"emma",firstname:"Emma",lastname:"Watson",phone_number:"9999999993",email:"emma@example.com",hash_pass:password,DOB:new Date("2001-04-01"),image_url:"https://i.pravatar.cc/150?img=4"}}),
  ]);

  const [nishidh,john,alice,emma]=users;

  await prisma.follow.createMany({data:[
    {followerId:john.id,followingId:nishidh.id},
    {followerId:alice.id,followingId:nishidh.id},
    {followerId:emma.id,followingId:nishidh.id},
    {followerId:nishidh.id,followingId:john.id},
    {followerId:nishidh.id,followingId:alice.id},
  ]});

  const post1=await prisma.post.create({
    data:{
      description:"Building my social media backend with Node.js and Prisma.",
      type:PostType.TEXT,
      userId:nishidh.id
    }
  });

  const post2=await prisma.post.create({
    data:{
      description:"GraphQL API is finally complete.",
      type:PostType.IMAGE,
      userId:nishidh.id,
      media:{
        create:{
          url:"https://picsum.photos/800/600",
          type:MediaType.IMAGE
        }
      }
    },
    include:{media:true}
  });

  const post3=await prisma.post.create({
    data:{
      description:"Weekend coding session.",
      type:PostType.TEXT,
      userId:john.id
    }
  });

  await prisma.like.createMany({data:[
    {userId:john.id,postId:post1.id},
    {userId:alice.id,postId:post1.id},
    {userId:emma.id,postId:post2.id},
    {userId:nishidh.id,postId:post3.id},
  ]});

  await prisma.comment.createMany({data:[
    {userId:john.id,postId:post1.id,content:"Looks awesome!"},
    {userId:alice.id,postId:post1.id,content:"Great work 👏"},
    {userId:emma.id,postId:post2.id,content:"Nice UI."},
  ]});

  await prisma.bookmark.create({
    data:{userId:john.id,postId:post2.id}
  });

  await prisma.repost.create({
    data:{userId:alice.id,postId:post1.id}
  });

  await prisma.share.create({
    data:{senderId:john.id,receiverId:emma.id,postId:post1.id}
  });

  for (const p of [post1,post2,post3]){
    await prisma.analytics.create({
      data:{
        postId:p.id,
        likeCount:await prisma.like.count({where:{postId:p.id}}),
        commentCount:await prisma.comment.count({where:{postId:p.id}}),
        respostCount:await prisma.repost.count({where:{postId:p.id}}),
        shareCount:await prisma.share.count({where:{postId:p.id}}),
        bookmarkCount:await prisma.bookmark.count({where:{postId:p.id}}),
        viewCount:0
      }
    });
  }

  const direct=await prisma.conversation.create({
    data:{type:ConversationType.DIRECT}
  });

  await prisma.conversationParticipant.createMany({data:[
    {conversationId:direct.id,userId:nishidh.id},
    {conversationId:direct.id,userId:john.id},
  ]});

  const msg1=await prisma.message.create({
    data:{
      conversationId:direct.id,
      senderId:nishidh.id,
      content:"Hey John!",
      type:MessageType.TEXT
    }
  });

  await prisma.message.create({
    data:{
      conversationId:direct.id,
      senderId:john.id,
      content:"Backend looks great!",
      type:MessageType.TEXT
    }
  });

  await prisma.messageRead.create({
    data:{messageId:msg1.id,userId:john.id}
  });

  const group=await prisma.conversation.create({
    data:{type:ConversationType.GROUP,name:"Backend Devs"}
  });

  await prisma.conversationParticipant.createMany({
    data:[
      {conversationId:group.id,userId:nishidh.id},
      {conversationId:group.id,userId:john.id},
      {conversationId:group.id,userId:alice.id},
      {conversationId:group.id,userId:emma.id},
    ]
  });

  const groupMsg=await prisma.message.create({
    data:{
      conversationId:group.id,
      senderId:alice.id,
      content:"Today's task is authentication.",
      type:MessageType.IMAGE
    }
  });

  await prisma.messageAttachment.create({
    data:{
      messageId:groupMsg.id,
      url:"https://picsum.photos/900/600",
      type:AttachmentType.IMAGE
    }
  });

  const group2=await prisma.conversation.create({
    data:{type:ConversationType.GROUP,name:"Design Team"}
  });

  await prisma.conversationParticipant.createMany({
    data:[
      {conversationId:group2.id,userId:nishidh.id},
      {conversationId:group2.id,userId:alice.id},
      {conversationId:group2.id,userId:emma.id},
    ]
  });

  await prisma.message.create({
    data:{
      conversationId:group2.id,
      senderId:emma.id,
      content:"New UI mockups are ready for review.",
      type:MessageType.TEXT
    }
  });

  const group3=await prisma.conversation.create({
    data:{type:ConversationType.GROUP,name:"Weekend Hackers"}
  });

  await prisma.conversationParticipant.createMany({
    data:[
      {conversationId:group3.id,userId:john.id},
      {conversationId:group3.id,userId:alice.id},
      {conversationId:group3.id,userId:emma.id},
    ]
  });

  await prisma.message.create({
    data:{
      conversationId:group3.id,
      senderId:john.id,
      content:"Let's ship the feature by Friday.",
      type:MessageType.TEXT
    }
  });

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(async()=>prisma.$disconnect());