import itertools
import player
import Cardset
import temp_player as tp


def evaluator_pineapple(p1, deck, best_hand=False):
    """
    Assumes there is a full flop and returns the best hand that the player has

    :param best_hand: Boolean that decides whether to return which of the 3 pairs was best
    :param p1: Player.cards[card][0=Rank, 1=Suit]
    :param deck: Deck of cards object of Card set

    :return: Strength of Hand "[0-9=HandStrength][Hand]"

    High Card = 0
    Pair = 1
    Two Pair = 2
    Three of kind = 3
    Straight = 4
    Flush = 5
    Full House = 6
    Four of a Kind = 7
    Straight FLush = 8
    Royal Flush = 9
    """

    if deck.community_cards == []:
        if p1.cards[0][0] == p1.cards[1][0] or p1.cards[0][0] == p1.cards[2][0]:
            return "1" + p1.cards[0][0]
        elif p1.cards[1][0] == p1.cards[2][0]:
            return "1" + p1.cards[1][0]
        else:
            return 0

    else:  # Calls individual evals of all three combos and then returns best eval
        zero_one = [p1.cards[0], p1.cards[1]]
        temp_player01 = tp.TempPlayer()
        temp_player01.set_cards(zero_one, deck)
        hand_01 = eval_standard(temp_player01, deck)

        zero_two = [p1.cards[0], p1.cards[2]]
        temp_player02 = tp.TempPlayer()
        temp_player02.set_cards(zero_two, deck)
        hand_02 = eval_standard(temp_player02, deck)

        one_two = [p1.cards[1], p1.cards[2]]
        temp_player12 = tp.TempPlayer()
        temp_player12.set_cards(one_two, deck)
        hand_12 = eval_standard(temp_player12, deck)

        better = eval_decoder_comparison(hand_01, hand_12, ret_string=True)
        best = eval_decoder_comparison(better, hand_02, ret_string=True)

        if best_hand:  # Returns which hand combo was the best
            if best == hand_01:
                return best, zero_one
            elif best == hand_02:
                return best, zero_two
            else:
                return best, one_two

        else:
            return best


def eval_standard(Player, deck):
    """
    Assuming 5+ cards b/w player & community cards, it finds the player's best hand

        :param Player: Class of Player
        :param deck: Deck of cards - with FULL flop
        :return: The strength of the hand the player has with the five cards he has as well

        High Card        = 0   (5 kickers)
        Pair             = 1   (3 Kickers)
        Two Pair         = 2   (1 Kickers) [Recognize largest]
        Three of kind    = 3   (2 Kickers)
        Straight         = 4   (0 Kickers) [Recognize largest - using kicker function]
        Flush            = 5   (0 Kickers) [Recognize largest - using kicker function]
        Full House       = 6   (0 Kickers) [Recognize largest - using kicker function]
        Four of a Kind   = 7   (1 Kickers)
        Straight FLush   = 8   (0 Kickers) [Recognize largest - using kicker function]
        Royal Flush      = 9   (0 Kickers) [Recognize largest - using kicker function]


        Full house can't have a flush
        Straights can't have a three of a kind



        Straights:
        "AKQJT" "AsKsQsJsTs", "AcKcQcJcTc", "AdKdQdJdTd", "AhKhQhJhTh",
        "KQJT9" "KsQsJsTs9s", "KcQcJcTc9c", "KdQdJdTd9d", "KhQhJhTh9h",
        "QJT98" "QsJsTs9s8s", "QcJcTc9c8c", "QdJdTd9d8d", "QhJhTh9h8h",
        "JT987" "JsTs9s8s7s", "JcTc9c8c7c", "JdTd9d8d7d", "JhTh9h8h7h",
        "T9876" "Ts9s8s7s6s", "Tc9c8c7c6c", "Td9d8d7d6d", "Th9h8h7h6h",
        "98765" "9s8s7s6s5s", "9c8c7c6c5c", "9d8d7d6d5d", "9h8h7h6h5h",
        "87654" "8s7s6s5s4s", "8c7c6c5c4c", "8d7d6d5d4d", "8h7h6h5h4h",
        "76543" "7s6s5s4s3s", "7c6c5c4c3c", "7d6d5d4d3d", "7h6h5h4h3h",
        "65432" "6s5s4s3s2s", "6c5c4c3c2c", "6d5d4d3d2d", "6h5h4h3h2h",
        "5432A" "5s4s3s2sAs", "5c4c3c2cAc", "5d4d3d2dAd", "5h4h3h2hAh"

        Royal Straights:
        "AsKsQsJsTs"
        "AcKcQcJcTc"
        "AdKdQdJdTd"
        "AhKhQhJhTh"
    """

    # Hold all community and player cards
    full = []

    # Boolean that turns true if there is a 5 or 10 in Full list
    straight_possible = False

    # Count of the ranks of player
    rank_count = {"A": 0, "K": 0, "Q": 0, "J": 0, "T": 0, "9": 0, "8": 0, "7": 0, "6": 0, "5": 0, "4": 0, "3": 0,
                  "2": 0}

    # Count of Suits
    suit_count = {"s": 0, "c": 0, "d": 0, "h": 0}

    # Adds all seven cards to the full list
    full.append(Player.cards[0])
    full.append(Player.cards[1])
    for c in deck.community_cards:
        full.append(c)

    full_length = len(full)

    # Sets the list in rank order
    full = kicker(full, full_length, True)

    # Updates rankCount with full cards
    for f in full:
        for key in rank_count.keys():
            if f[0] == key:
                rank_count[key] += 1

    # Updates suit count
    for card in full:
        if card[1] == "s":
            suit_count["s"] += 1

        elif card[1] == "c":
            suit_count["c"] += 1

        elif card[1] == "d":
            suit_count["d"] += 1

        elif card[1] == "h":
            suit_count["h"] += 1

    # Checks if a straight is possible
    if rank_count["5"] >= 1 or rank_count["T"] >= 1:
        straight_possible = True

    # Flush
    for suit in suit_count:
        if suit_count[suit] == 3 or suit_count[suit] == 4:
            break  # Cannot have a flush if 3 of the 7 cards are one suit
        if suit_count[suit] >= 5 and not straight_possible:  # Non-straight/royal
            tempList = []
            for card in full:
                if card[1] == suit:
                    tempList.append(card)
            hand = kicker(tempList, 5)
            return "5" + hand

        elif suit_count[suit] >= 5 and straight_possible:
            tempList = []
            for card in full:
                if card[1] == suit:
                    tempList.append(card)
            assess = straight_check(tempList)
            if assess == "NA":  # Not straight/royal flush
                hand = kicker(tempList, 5)
                return "5" + hand
            else:  # Straight/Royal
                return assess

    # Returns straight if one exists
    pos_straight = straight_check(full)
    if pos_straight != "NA":
        return pos_straight

    # Booleans/list to decipher through pairs, two pairs, and three pairs
    pair_list = []

    # Identifying Four of a Kind,Full House, Three of a Kind, Pairs, and Two Pairs
    for keys in rank_count:  # A-2
        if rank_count[keys] == 4:
            tempList = []  # List of non-paired cards
            hand = ""

            # Creates list of cards to be ranked for kicker
            for fin in full:  # All 7 cards (5 community + 2 player cards)

                if fin[0] != keys[0]:
                    tempList.append(fin)
                else:
                    hand += fin

            hand += kicker(tempList, 1)
            return "7" + hand  # Four of a Kind

        if rank_count[keys] == 3:
            for k in rank_count:
                if k == keys:
                    continue

                if rank_count[k] >= 2:  # Full House
                    hand = "6"
                    for card in full:
                        if len(hand) >= 10:
                            return hand
                        if card[0] == keys:
                            hand += card
                    for kard in full:
                        if kard[0] == k:
                            hand += kard
                    return hand

            else:
                tempList = []  # List of non-paired cards
                hand = ""

                for fin in full:  # All 7 cards (5 community + 2 player cards)

                    if fin[0] != keys[0]:
                        tempList.append(fin)
                    else:
                        hand += fin

                hand += kicker(tempList, 2)

                return "3" + hand

        if rank_count[keys] == 2:
            pair_list.append(keys)

    amt_pairs = len(pair_list)

    if amt_pairs == 0:
        return "0" + kicker(full, 5)

    if amt_pairs == 1:
        hand = "1"
        temp_list = []
        for card in full:
            if card[0] == pair_list[0]:
                hand += card
            else:
                temp_list.append(card)

        return hand + kicker(temp_list, 3)

    if amt_pairs == 2:  # Relies on the fact that ranks are iterator in order of strength
        hand = "2"
        temp_list = []
        for card in full:
            if card[0] == pair_list[0] or card[0] == pair_list[1]:
                hand += card
            else:
                temp_list.append(card)

        return hand + kicker(temp_list, 1)

    if amt_pairs == 3:  # Relies on the fact that ranks are iterator in order of strength
        # Triple Pair
        hand = "2"
        temp_list = []
        i = 0
        for card in full:
            if len(hand) >= 9:
                return hand + full[i + 1]
                # break
            elif card[0] == pair_list[0] or card[0] == pair_list[1]:
                hand += card
                i += 1
            else:
                temp_list.append(card)
                i += 1

        return hand + kicker(temp_list, 1)


def kicker(fin_list, num_kickers, ret_list=False):
    """
    Sorts list into a rank ordered string

    :param ret_list: Determines whether I return the list or string format
    :param fin_list: list of cards
    :param num_kickers: number of cards that need to be ranked
    :return: String rep of the greatest kickers (Tie in rank goes to order of fin_list)

            Recognizes the cards that aren't being used (like the pair) before function call
    """
    if len(fin_list) == 0:
        raise Exception("Empty List of Cards")

    final_str = ""
    final_list = []
    rank_dict = {"A": 13, "K": 12, "Q": 11, "J": 10, "T": 9, "9": 8, "8": 7, "7": 6, "6": 5, "5": 4, "4": 3, "3": 2,
                 "2": 1}

    list_dict = {}

    for elt in fin_list:
        list_dict[elt] = rank_dict[elt[0]]  # Assigns values to each card in finList

    sorted_dict = sorted(list_dict.items(), key=lambda x: x[1],
                         reverse=True)  # List of tuples sorted Biggest to smallest

    if ret_list:
        for i in range(num_kickers):
            final_list.append(sorted_dict[i][0])

        return final_list

    else:
        for i in range(num_kickers):
            final_str += sorted_dict[i][0]

        return final_str


def straight_check(full_list):
    """
    :param full_list: List of Cards
    :return: The Highest straight, in string form or indicator of no straight (NA)
             i.e. "45s4h3d2cAc" or "9AsKsQsJsTs" or "8KsQsJsTs9s"
             Specified the largest straight using kicker function to sort in order of rank
    """
    straight_list = ['AKQJT',
                     'KQJT9',
                     'QJT98',
                     'JT987',
                     'T9876',
                     '98765',
                     '87654',
                     '76543',
                     '65432',
                     'A5432']

    sf = ["KsQsJsTs9s", "KcQcJcTc9c", "KdQdJdTd9d", "KhQhJhTh9h",
          "QsJsTs9s8s", "QcJcTc9c8c", "QdJdTd9d8d", "QhJhTh9h8h",
          "JsTs9s8s7s", "JcTc9c8c7c", "JdTd9d8d7d", "JhTh9h8h7h",
          "Ts9s8s7s6s", "Tc9c8c7c6c", "Td9d8d7d6d", "Th9h8h7h6h",
          "9s8s7s6s5s", "9c8c7c6c5c", "9d8d7d6d5d", "9h8h7h6h5h",
          "8s7s6s5s4s", "8c7c6c5c4c", "8d7d6d5d4d", "8h7h6h5h4h",
          "7s6s5s4s3s", "7c6c5c4c3c", "7d6d5d4d3d", "7h6h5h4h3h",
          "6s5s4s3s2s", "6c5c4c3c2c", "6d5d4d3d2d", "6h5h4h3h2h",
          "5s4s3s2sAs", "5c4c3c2cAc", "5d4d3d2dAd", "5h4h3h2hAh",
          "As5s4s3s2s", "Ac5c4c3c2c", "Ad5d4d3d2d", "Ah5h4h3h2h"]  # Two ways for wheel, I am unsure of implementation

    royal = ["AsKsQsJsTs", "AcKcQcJcTc", "AdKdQdJdTd", "AhKhQhJhTh"]
    finland = ""

    length = len(full_list)
    if length == 5:
        r = []
        for a in range(5):
            r.append(full_list[a][0])
        ranks = kicker(r, 5)

        if ranks in straight_list:  # Deals with Straights

            final = kicker(full_list, 5)

            if final in sf:
                final = "8" + final
                return final
            elif final in royal:
                final = "9" + final
                return final
            else:
                return "4" + final

        else:
            return "NA"

    if length == 6:
        sor = kicker(full_list, 6)
        t = []
        for i in range(6):
            t.append(sor[2 * i:2 * i + 2])
        for comb in itertools.combinations(t, 5):
            ranks = "{a}{b}{c}{d}{e}".format(a=comb[0][0], b=comb[1][0], c=comb[2][0], d=comb[3][0], e=comb[4][0])

            if ranks in straight_list:
                if ranks == "A5432":
                    finland = comb[0] + comb[1] + comb[2] + comb[3] + comb[4]
                    if finland in sf:
                        finland = "8" + finland
                    else:
                        finland = "4" + finland
                    continue

                fin = comb[0] + comb[1] + comb[2] + comb[3] + comb[4]

                if fin in royal:
                    return "9" + fin
                elif fin in sf:
                    return "8" + fin
                else:
                    return "4" + fin

    if length == 7:
        sor = kicker(full_list, 7)  # Returns a string of sorted ranks
        t = []
        for i in range(7):
            t.append(sor[2 * i:2 * i + 2])  # Parses string and puts them into a list
        for comb in itertools.combinations(t, 5):
            ranks = "{a}{b}{c}{d}{e}".format(a=comb[0][0], b=comb[1][0], c=comb[2][0], d=comb[3][0], e=comb[4][0])

            if ranks in straight_list:
                if ranks == "A5432":
                    finland = comb[0] + comb[1] + comb[2] + comb[3] + comb[4]
                    if finland in sf:
                        finland = "8" + finland
                    else:
                        finland = "4" + finland
                    continue

                fin = comb[0] + comb[1] + comb[2] + comb[3] + comb[4]

                if fin in royal:
                    return "9" + fin
                elif fin in sf:
                    return "8" + fin
                else:
                    return "4" + fin
    if finland == "":
        return "NA"
    else:
        return finland


def eval_decoder_comparison(p1_string, p2_string, ret_string=False, ret_list=False):
    """
    Takes the two player strings from the eval function and returns the winner

    :param ret_string: Boolean whether to return string or number value
    :param p1_string: [0-9] + five card hand (String)
    :param p2_string: [0-9] + five card hand (String)
    :return: Winning hand (p1 = 1, p2 = 2, chop = 0), Winning String, or string, int code
    """
    if p1_string == p2_string:
        if ret_list:
            return p1_string, 0
        if ret_string:
            return p1_string
        return 0

    p1_hand = int(p1_string[0])
    p2_hand = int(p2_string[0])

    if p1_hand > p2_hand:
        if ret_list:
            return p1_string, 1
        if ret_string:
            return p1_string
        return 1
    elif p2_hand > p1_hand:
        if ret_list:
            return p2_string, 2
        if ret_string:
            return p2_string
        return 2
    else:
        if p1_hand == 4:  # Checks the second card to get the best straight since A's can be the best and worst straight
            rank_dict = {"A": 13, "K": 12, "Q": 11, "J": 10, "T": 9, "9": 8, "8": 7, "7": 6, "6": 5, "5": 4, "4": 3,
                         "3": 2,
                         "2": 1}
            if rank_dict[p1_string[3]] > rank_dict[p2_string[3]]:
                if ret_list:
                    return p1_string, 1
                if ret_string:
                    return p1_string
                return 1
            elif rank_dict[p1_string[3]] < rank_dict[p2_string[3]]:
                if ret_list:
                    return p2_string, 2
                if ret_string:
                    return p2_string
                return 2
            elif p1_string[1] == "A":  # Deals with 6-high v Wheel Straights

                if p2_string[1] == "A":  # Both have wheel or broadway
                    if ret_list:
                        return p1_string, 0
                    if ret_string:
                        return p2_string
                    return 0

                # Player 1 has a wheel & p2 has a 6-high straight
                if ret_list:
                    return p2_string, 2
                if ret_string:
                    return p2_string
                return 2

            elif p2_string[1] == "A":  # Deals with 6-high v Wheel Straights
                if ret_list:
                    return p1_string, 1
                if ret_string:
                    return p1_string
                return 1

            else:  # Same straight without Ace
                if ret_list:
                    return p1_string, 0
                if ret_string:
                    return p1_string
                return 0

        rank_dict = {"A": 13, "K": 12, "Q": 11, "J": 10, "T": 9, "9": 8, "8": 7, "7": 6, "6": 5, "5": 4, "4": 3, "3": 2,
                     "2": 1}
        for i in range(5):
            p1 = rank_dict[p1_string[1 + 2 * i]]
            p2 = rank_dict[p2_string[1 + 2 * i]]

            if p1 > p2:
                if ret_list:
                    return p1_string, 1
                if ret_string:
                    return p1_string
                return 1
            elif p2 > p1:
                if ret_list:
                    return p2_string, 2
                if ret_string:
                    return p2_string
                return 2

        if ret_list:
            return p1_string, 0
        if ret_string:
            return p1_string
        return 0  # If their ranks are all the same, then return a chop (different suits)


if __name__ == "__main__":
    # print(kicker(["As", "5s", "7s", "9s", "2s"], 5))
    deck = Cardset.Cardset()
    player = player.Player()
    player.set_cards(["Ts", "As"], deck)
    deck.set_community_cards(["4s", "8s", "2h", "9h", "5s"])
    a = eval_standard(player, deck)
    b = straight_check(["9s", "8s", "7h", "Js", "Ts"])
    c = "2AsAcQsQc4d"
    d = "3AsAcAsTc3s"
    print(a)
    print(b)
    print(eval_decoder_comparison(a, b))
    print(eval_decoder_comparison(c, d, True))
