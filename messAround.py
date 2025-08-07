import random
import itertools


def test_sample():
    l = ("As", "Ac", "Ad", "Ah",
             "Ks", "Kc", "Kd", "Kh",
             "Qs", "Qc", "Qd", "Qh",
             "Js", "Jc", "Jd", "Jh",
             "Ts", "Tc", "Td", "Th",
             "9s", "9c", "9d", "9h",
             "8s", "8c", "8d", "8h",
             "7s", "7c", "7d", "7h",
             "6s", "6c", "6d", "6h",
             "5s", "5c", "5d", "5h",
             "4s", "4c", "4d", "4h",
             "3s", "3c", "3d", "3h",
             "2s", "2c", "2d", "2h"
             )
    return random.sample(l, 3)

def rangeTester(n):
    for i in range(n):
        print(i)

def stringEdits(n, letter):
    a = "ABCDEFGHIJK"
    a = a[:n] + letter + a[n+1:]
    print(a)

def sortedDicts(dict):
    print(sorted(dict, reverse=True))

def iter_comb(l):
    a = itertools.combinations(l, 5)
    i = 1
    for comb in a:
        # print("{a}. {b}".format(a=i, b=comb))
        # i+=1
        s = comb[0]+comb[1]+comb[2]+comb[3]+comb[4]
        print(s)

def in_a_list(l, stri):
    if stri in l:
        print("yes")
    else:
        print("No")

def rang(n):
    for a in range(n):
        print(a)





if __name__ == "__main__":
    # d = {"As":0, "Ks":7, "Kh":3, "8s":6, "6c":2}
    # sortedDicts(d)
    # iter_comb(["Qs", "8s", "7h", "Js", "Ts", "9c","2s"])
    #in_a_list(['QJT98', "A"], "QJT98")
    t = (0.1784278278, 2.787438, 9.781202939)

    print("{:.a}")