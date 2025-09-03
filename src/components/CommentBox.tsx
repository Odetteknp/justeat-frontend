import "./CommentBox.css"

interface Props {
  comment: string;
  setComment: (comment: string) => void;
}

export default function CommentBox({ comment, setComment }: Props) {
  return (
    <textarea
      className="commentBox"
      placeholder="แสดงความคิดเห็นของคุณ..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
    />
  );
}
