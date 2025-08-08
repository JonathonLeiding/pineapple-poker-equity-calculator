import unittest
import evaluator as ev
import player as p
import Cardset as c


class EvaluatorStandard(unittest.TestCase):
    """
    Test Suite to check if ev.eval_standard(player, deck) runs as expected
    """

    def test_high_card(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Kh", "Td", "8s", "2h", "Ac"])
        a.set_cards(["6s", "5c"], d)
        self.assertEqual("0AcKhTd8s6s", ev.eval_standard(a, d))

    def test_pair(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Kh", "Td", "8s", "2h", "Ac"])
        a.set_cards(["As", "5c"], d)
        self.assertEqual("1AsAcKhTd8s", ev.eval_standard(a, d))

    def test_two_pair(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Kh", "Td", "8s", "2h", "Ac"])
        a.set_cards(["As", "Kc"], d)
        self.assertEqual("2AsAcKcKhTd", ev.eval_standard(a, d))

    def test_two_pair_pockets(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Td", "8s", "2h", "Ac", "Ts"])
        a.set_cards(["Ks", "Kc"], d)
        self.assertEqual("2KsKcTdTsAc", ev.eval_standard(a, d))

    def test_triple_pair(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Td", "8s", "2h", "8c", "Ts"])
        a.set_cards(["Ks", "Kc"], d)
        self.assertEqual("2KsKcTdTs8c", ev.eval_standard(a, d))

    def test_three_of_a_kind(self):
        """
        Tests for a three of a kind
        :return: Implies that the hand is put first in the hand layout before community cards
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Kh", "Td", "8s", "2h", "Ac"])
        a.set_cards(["As", "Ad"], d)
        self.assertEqual("3AsAdAcKhTd", ev.eval_standard(a, d))

    def test_just_straight(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Kh", "Td", "8s", "2h", "6c"])
        a.set_cards(["9s", "7c"], d)
        self.assertEqual("4Td9s8s7c6c", ev.eval_standard(a, d))

    def test_straight_plus(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["7h", "Td", "8s", "6h", "6d"])
        a.set_cards(["9s", "6c"], d)
        self.assertEqual("4Td9s8s7h6c", ev.eval_standard(a, d))

    def test_Straight_Flush_wheel_6(self):
        """
        :return: Checks if it Catches a straight flush
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["4s", "As", "Ks", "2s", "3s"])
        a.set_cards(["6s", "5s"], d)
        self.assertEqual("86s5s4s3s2s", ev.eval_standard(a, d))

    def test_just_flush(self):  # Failing Initially Not catching flushes
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Ks", "Td", "8s", "2h", "4s"])
        a.set_cards(["9s", "7s"], d)
        self.assertEqual("5Ks9s8s7s4s", ev.eval_standard(a, d))

    def test_flush_plus(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Ks", "Td", "8s", "6h", "4s"])
        a.set_cards(["9s", "7s"], d)
        self.assertEqual("5Ks9s8s7s4s", ev.eval_standard(a, d))

    def test_full_house_basic(self):
        """
        :return: Checks if it Catches full houses where the 3 of a kind rank is higher than the pair
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["4h", "Ks", "7d", "8s", "4s"])
        a.set_cards(["7s", "7h"], d)
        self.assertEqual("67s7h7d4h4s", ev.eval_standard(a, d))

    def test_full_house_pairs(self):  # Not Catching full houses
        """

        :return: Checks if it Catches full houses where the 3 of a kind rank is lower than the pair
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["4c", "9d", "7c", "9s", "4s"])
        a.set_cards(["7s", "7h"], d)
        self.assertEqual("67s7h7c9d9s", ev.eval_standard(a, d))

    def test_4_kind(self):
        """
        :return: Checks if it Catches 4 of a kind
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["9h", "Ks", "7d", "7c", "9s"])
        a.set_cards(["7s", "7h"], d)
        self.assertEqual("77s7h7d7cKs", ev.eval_standard(a, d))

    def test_Straight_Flush(self):
        """
        :return: Checks if it Catches a straight flush
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["4s", "Ks", "7s", "8s", "3s"])
        a.set_cards(["6s", "5s"], d)
        self.assertEqual("88s7s6s5s4s", ev.eval_standard(a, d))

    def test_straight_flush_wheel_6(self):
        """
        :return: Checks if it Catches a straight flush
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["4s", "As", "Ks", "2s", "3s"])
        a.set_cards(["6s", "5s"], d)
        self.assertEqual("86s5s4s3s2s", ev.eval_standard(a, d))

    def test_royal_flush(self):
        """
        :return: Checks if it Catches a royal flush
        """
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["4s", "Ks", "Qs", "Js", "5s"])
        a.set_cards(["As", "Ts"], d)
        self.assertEqual("9AsKsQsJsTs", ev.eval_standard(a, d))


class Straight(unittest.TestCase):
    """
    Test Suite to check if the implementation of ev.straight_check is running as expected

    Should test list lengths 7, 6, 5 for S, SF, RF, NA
    """

    def test_wheel_scattered(self):
        full_list = ["3s", "7s", "Ac", "4d", "9h", "5h", "2c"]
        self.assertEqual("4Ac5h4d3s2c", ev.straight_check(full_list))

    def test_wheel_plus1(self):
        """
        :return: Checks if the straight returned is the wheel or 6-high straight
        """
        full_list = ["3s", "6s", "Ac", "4d", "9h", "5h", "2c"]
        self.assertEqual("46s5h4d3s2c", ev.straight_check(full_list))

    def test_broadway(self):
        full_list = ["Js", "Ts", "Ac", "Kd", "9h", "5h", "Qc"]
        self.assertEqual("4AcKdQcJsTs", ev.straight_check(full_list))

    def test_multiple_not_ranked(self):
        full_list = ["Ks", "Qd", "Jc", "Th", "9s", "Ac", "8c"]
        self.assertEqual("4AcKsQdJcTh", ev.straight_check(full_list))

    def test_mid_straight(self):
        full_list = ["Ks", "6d", "7c", "Th", "9s", "Ac", "8c"]
        self.assertEqual("4Th9s8c7c6d", ev.straight_check(full_list))

    def test_na(self):
        full_list = ["Ks", "6d", "7c", "3h", "9s", "Ac", "8c"]
        self.assertEqual("NA", ev.straight_check(full_list))


class Kicker(unittest.TestCase):
    def test_broadway5(self):
        full_list = ["Ks", "Qd", "Jc", "Th", "9s", "Ac", "8c"]
        self.assertEqual("AcKsQdJcTh", ev.kicker(full_list, 5))

    def test_pair_ranks5(self):
        full_list = ["Ks", "Qd", "Jc", "4s", "9s", "Ac", "Ad"]
        self.assertEqual("AcAdKsQdJc", ev.kicker(full_list, 5))

    def test_one(self):
        full_list = ["8c"]
        self.assertEqual("8c", ev.kicker(full_list, 1))

    def test_one_two(self):
        full_list = ["8c", "4d"]
        self.assertEqual("8c", ev.kicker(full_list, 1))

    def test_two(self):
        full_list = ["Ad", "Ac"]
        self.assertEqual("AdAc", ev.kicker(full_list, 2))

    def test_three(self):
        full_list = ["Ad", "Ac", "Kc"]
        self.assertEqual("AdAcKc", ev.kicker(full_list, 3))

    def test_random(self):
        full_list = ["Ks", "Qd", "Jc", "4s", "9s", "Ac", "Ad"]
        self.assertEqual("AcAdKsQdJc9s4s", ev.kicker(full_list, 7))

    def test_return_list(self):
        full_list = ["Ks", "Jc", "4s", "9s", "Qd", "Ac", "Ad"]
        self.assertEqual(["Ac", "Ad", "Ks", "Qd", "Jc", "9s", "4s"], ev.kicker(full_list, 7, True))


class Decoder(unittest.TestCase):
    def test_different_hands1(self):
        p1_string = "4Th9s8c7c6d"
        p2_string = "2AcAdKsKh2c"
        self.assertEqual(1, ev.eval_decoder_comparison(p1_string, p2_string))

    def test_different_hands2(self):
        p1_string = "0As9d8c5c4s"
        p2_string = "2AcAdKsKh2c"
        self.assertEqual(2, ev.eval_decoder_comparison(p1_string, p2_string))

    def test_same_hand_diff_suit(self):
        p1_string = "2AsAdKcKh2s"
        p2_string = "2AcAdKsKh2c"
        self.assertEqual(0, ev.eval_decoder_comparison(p1_string, p2_string))

    def test_kicker(self):
        p1_string = "0As9d8c5h4s"
        p2_string = "0As9d8c5d2s"
        self.assertEqual(1, ev.eval_decoder_comparison(p1_string, p2_string))

    def test_kicker2(self):
        p1_string = "5As9s8s5s4s"
        p2_string = "5As9s8s7s6s"
        self.assertEqual(2, ev.eval_decoder_comparison(p1_string, p2_string))

    def test_kicker3(self):
        p1_string = "4As5s4s3c2c"
        p2_string = "4KsQsJsTd9h"
        self.assertEqual(2, ev.eval_decoder_comparison(p1_string, p2_string))

    def test_kicker3_ret(self):
        p1_string = "4As5s4s3c2c"
        p2_string = "4KsQsJsTd9h"
        self.assertEqual("4KsQsJsTd9h", ev.eval_decoder_comparison(p1_string, p2_string, True))

    def test_kicker2_ret(self):
        p1_string = "5As9s8s5s4s"
        p2_string = "5As9s8s7s6s"
        self.assertEqual("5As9s8s7s6s", ev.eval_decoder_comparison(p1_string, p2_string, True))

    def test_kicker_ret(self):
        p1_string = "0As9d8c5h4s"
        p2_string = "0As9d8c5d2s"
        self.assertEqual("0As9d8c5h4s", ev.eval_decoder_comparison(p1_string, p2_string, True))

    def test_kicker_6_wheel(self):
        p1_string = "4As5s4s3c2c"
        p2_string = "46c5s4s3d2c"
        self.assertEqual(2, ev.eval_decoder_comparison(p1_string, p2_string))


class EvalPineapple(unittest.TestCase):
    def test_high_card(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["Kh", "Td", "8s", "2h", "Ac"])
        a.set_cards(["9s", "Qc", "3h"], d)
        self.assertEqual("0AcKhQcTd9s", ev.evaluator_pineapple(a, d))

    def test_pairs_straight(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["3c", "9d", "8s", "Th", "Jc"])
        a.set_cards(["9s", "Qc", "3h"], d)
        self.assertEqual("4QcJcTh9s8s", ev.evaluator_pineapple(a, d))

    def test_wheel_v_6high(self):
        a = p.Player()
        d = c.Cardset()
        d.set_community_cards(["3c", "4d", "8s", "2h", "Ac"])
        a.set_cards(["Ah", "5c", "6s"], d)
        self.assertEqual("46s5c4d3c2h", ev.evaluator_pineapple(a, d))


if __name__ == '__main__':
    unittest.main()
