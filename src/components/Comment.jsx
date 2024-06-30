import { Avatar, Divider } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { getOneData, updateData } from "../services/services";
import { setGlobalUser } from "../contexts/userSlice";

export const Comment = ({ comment, setCommentList }) => {
  const userGlobal = useSelector((state) => state.user.value);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const isMatch = comment.likes.filter(
      (item) => item._id === userGlobal?._id
    );

    isMatch.length > 0 ? setIsLiked(true) : setIsLiked(false);
  }, [userGlobal]);

  const sendLike = async (like) => {
    if (!userGlobal) {
      alert("Inicia sesión para interactuar...");
      navigate("/login");
      return;
    }
    if (like) {
      const { likes } = await getOneData("/comment/", comment._id);
      likes.push(userGlobal._id);
      const resStatus = await updateData("/comment/", comment._id, {
        likes,
      });
      if (resStatus.status.toLocaleString().startsWith("4")) {
        alert("Ha ocurrido un error inesperado, vuelve a intentarlo...");
        return;
      }
      const user = await getOneData("/auth/", userGlobal._id);
      user.commentLikes.push(comment._id);
      const userStatus = await updateData("/auth/like/", userGlobal._id, {
        commentLikes: user.commentLikes,
      });
      const userJSON = await userStatus.json();
      if (userStatus.status.toLocaleString().startsWith("4")) {
        alert("Ha ocurrido un error inesperado, vuelve a intentarlo...");
        return;
      }
      dispatch(setGlobalUser(userJSON));
      const resData = await getOneData(
        "/publication/",
        location.pathname.split("/")[2]
      );
      setCommentList(resData.comments.reverse());
      setIsLiked(like);
    } else {
      const { likes } = await getOneData("/comment/", comment._id);
      const disLike = likes.filter((item) => item._id !== userGlobal._id);
      const resStatus = await updateData("/comment/", comment._id, {
        likes: disLike,
      });
      if (resStatus.status.toLocaleString().startsWith("4")) {
        alert("Ha ocurrido un error inesperado, vuelve a intentarlo...");
        return;
      }
      const user = await getOneData("/auth/", userGlobal._id);
      const disLikeUser = user.commentLikes.filter(
        (item) => item !== comment._id
      );
      const userStatus = await updateData("/auth/like/", userGlobal._id, {
        commentLikes: disLikeUser,
      });
      const userJSON = await userStatus.json();
      if (userStatus.status.toLocaleString().startsWith("4")) {
        alert("Ha ocurrido un error inesperado, vuelve a intentarlo...");
        return;
      }
      dispatch(setGlobalUser(userJSON));
      const resData = await getOneData(
        "/publication/",
        location.pathname.split("/")[2]
      );
      setCommentList(resData.comments.reverse());
      setIsLiked(like);
    }
  };

  return (
    <article
      id={comment._id}
      className="flex flex-col items-start justify-between shadow-md p-3 rounded-md"
    >
      <div className="flex justify-between items-center gap-x-4 text-xs w-full">
        <div className="flex items-center gap-3">
          <Avatar
            alt={comment.author[0].username}
            src={comment.author[0].icon}
          />
          <p className="font-semibold text-gray-900">
            <Link to={`/user/${comment.author[0]._id}`}>
              {comment.author[0].username}
            </Link>
          </p>
        </div>
        <time dateTime={comment.date} className="text-gray-500">
          {comment.date.split("T")[0]}{" "}
          {comment.date.split("T")[1].split(":")[0] - 3}:
          {comment.date.split("T")[1].split(":")[1]}
        </time>
      </div>
      <div className="group relative w-full">
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
          {comment.content}
        </p>
        <br />
        <Divider />
        <div className="flex justify-between mt-3">
          <div className="flex gap-1">
            {isLiked ? (
              <FavoriteIcon
                onClick={() => sendLike(false)}
                className="cursor-pointer"
              />
            ) : (
              <FavoriteBorderIcon
                onClick={() => sendLike(true)}
                className="cursor-pointer"
              />
            )}
            <span>
              <b>{comment.likes.length}</b>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
