(defn two-sum [nums target]
  (loop [i 0 seen {}]
    (when (< i (count nums))
      (let [n (nth nums i)
            complement (- target n)]
        (if-let [j (seen complement)]
          [j i]
          (recur (inc i) (assoc seen n i)))))))
