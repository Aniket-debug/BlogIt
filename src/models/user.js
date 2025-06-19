const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createToken } = require("../service/authentication");

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    profileImageURL: {
      type: String,
    },
    blogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "blog",
      },
    ],
  },
  { timestamps: true }
);


userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;
  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");
  this.salt = salt;
  this.password = hashedPassword;
  next();
});

userSchema.static("matchUserAndReturnToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User Not Found");
  const salt = user.salt;
  const hashedPassword = user.password;

  const usreProvidedPasswordHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (hashedPassword !== usreProvidedPasswordHash) {
    throw new Error("Incorrect Password");
  }

  const token = createToken(user);

  return token;
});

const User = model("user", userSchema);

module.exports = User;
