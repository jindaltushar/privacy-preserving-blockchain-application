export default function OtherUserProfile({
  params,
}: {
  params: {
    userid: string;
  };
}) {
  return <div>Other User Profile {params.userid}</div>;
}
