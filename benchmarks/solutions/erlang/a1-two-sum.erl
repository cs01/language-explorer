-module(two_sum).
-export([two_sum/2]).

two_sum(Nums, Target) ->
    two_sum(Nums, Target, #{}, 0).

two_sum([], _Target, _Seen, _I) ->
    {-1, -1};
two_sum([N | Rest], Target, Seen, I) ->
    Complement = Target - N,
    case maps:find(Complement, Seen) of
        {ok, J} -> {J, I};
        error -> two_sum(Rest, Target, Seen#{N => I}, I + 1)
    end.
