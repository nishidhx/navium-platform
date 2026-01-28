export const userSafeSelect = {
    id: true,
    username: true,
    firstname: true,
    lastname: true,
    phone_number: true,   
    email: true,          
    DOB: true,            
    image_url: true,
    createdAt: true,
    posts: false,
    followers: false,
    following: false,
    likes: false,
    reposts: false,
    comments: false,
    sentShares: false,
    receivedShares: false,
    Bookmarks: false,
};

export const userPublicSelect = {
  id: true,
  username: true,
  firstname: true,
  lastname: true,
  image_url: true,
};

export const userPrivateSelect = {
  ...userPublicSelect,
  email: true,
  phone_number: true,
  DOB: true,
  createdAt: true,
};

export const userAuthSelect = {
  id: true,
  username: true,
  email: true,
  hash_pass: true, // hash pass only select here
};
