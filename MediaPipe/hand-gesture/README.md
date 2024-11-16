import close_hand from "./emoji/close-removebg-preview.png";
import finger_up from "./emoji/fingerup-removebg-preview.png";
import open_plum from "./emoji/openplum-removebg-preview.png";
import rock from "./emoji/rock-removebg-preview.png";
import thumb_down from "./emoji/thumbdown-removebg-preview.png";
import thumb_up from "./emoji/thumbsup-removebg-preview.png";
import victory from "./emoji/victory-removebg-preview.png";

const gestureToEmojiMap = {
Victory: victory,
Thumb_Up: thumb_up,
Thumb_Down: thumb_down,
Open_Palm: open_plum,
Pointing_Up: finger_up,
Closed_Fist: close_hand,
ILoveYou: rock,
};
const [emoji, setEmoji] = useState(null);

const getEmoji = gestureToEmojiMap[categoryName] || null;
setEmoji(getEmoji);

{emoji !== null ? (
<img
src={gestureToEmojiMap[emoji]}
style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
/>
) : (
""
)
}
