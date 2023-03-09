import { JsonSerializable } from './JsonSerializable.js';

// mcstolen from https://www.mongodb.com/docs/manual/reference/operator/aggregation/
export type Operator =
	| JsonSerializable

	//// Arithmetic Expression Operators
	/// Arithmetic expressions perform mathematic operations on numbers. Some arithmetic expressions can also support date arithmetic.
	// Returns the absolute value of a number.
	| { $abs: Operator }
	// Adds numbers to return the sum, or adds numbers and a date to return a new date. If adding numbers and a date, treats the numbers as milliseconds. Accepts any number of argument expressions, but at most, one expression can resolve to a date.
	| { $add: Operator[] }
	// Returns the smallest integer greater than or equal to the specified number.
	| { $ceil: Operator }
	// Returns the result of dividing the first number by the second. Accepts two argument expressions.
	| { $divide: [Operator, Operator] }
	// Raises e to the specified exponent.
	| { $exp: [Operator, Operator] }
	// Returns the largest integer less than or equal to the specified number.
	| { $floor: Operator }
	// Calculates the natural log of a number.
	| { $ln: Operator }
	// Calculates the log of a number in the specified base.
	| { $log: [Operator, Operator] }
	// Calculates the log base 10 of a number.
	| { $log10: Operator }
	// Returns the remainder of the first number divided by the second. Accepts two argument expressions.
	| { $mod: [Operator, Operator] }
	// Multiplies numbers to return the product. Accepts any number of argument expressions.
	| { $multiply: Operator[] }
	// Raises a number to the specified exponent.
	| { $pow: [Operator, Operator] }
	// Rounds a number to to a whole integer or to a specified decimal place.
	| { $round: [Operator] | [Operator, Operator] }
	// Calculates the square root.
	| { $sqrt: Operator }
	// Returns the result of subtracting the second value from the first. If the two values are numbers, return the difference. If the two values are dates, return the difference in milliseconds. If the two values are a date and a number in milliseconds, return the resulting date. Accepts two argument expressions. If the two values are a date and a number, specify the date argument first as it is not meaningful to subtract a date from a number.
	| { $subtract: [Operator, Operator] }
	// Truncates a number to a whole integer or to a specified decimal place.
	| { $trunc: [Operator] | [Operator, Operator] }

	//// Array Expression Operators
	// Returns the element at the specified array index.
	| { $arrayElemAt: [Operator, Operator] }
	// Converts an array of key value pairs to a document.
	| { $arrayToObject: Operator }
	// Concatenates arrays to return the concatenated array.
	| { $concatArrays: [Operator, Operator] }
	// Selects a subset of the array to return an array with only the elements that match the filter condition.
	| {
			$filter: {
				input: Operator;
				cond: Operator;
				as?: Operator;
				limit?: Operator;
			};
	  }
	// Returns the first array element. Distinct from $first accumulator.
	| { $first: Operator }
	// Returns a specified number of elements from the beginning of an array. Distinct from the $firstN accumulator.
	| {
			$firstN: {
				input: Operator;
				n: Operator;
			};
	  }
	// Returns a boolean indicating whether a specified value is in an array.
	| { $in: [Operator, Operator] }
	// Searches an array for an occurrence of a specified value and returns the array index of the first occurrence. If the substring is not found, returns -1.
	| {
			$indexOfArray:
				| [Operator, Operator]
				| [Operator, Operator, Operator]
				| [Operator, Operator, Operator, Operator];
	  }
	// Determines if the operand is an array. Returns a boolean.
	| { $isArray: Operator }
	// Returns the last array element. Distinct from $last accumulator.
	| { $last: Operator }
	// Returns a specified number of elements from the end of an array. Distinct from the $lastN accumulator.
	| {
			$lastN: {
				input: Operator;
				n: Operator;
			};
	  }
	// Applies a subexpression to each element of an array and returns the array of resulting values in order. Accepts named parameters.
	| {
			$map: {
				input: Operator;
				as?: Operator;
				in: Operator;
			};
	  }
	// Returns the n largest values in an array. Distinct from the $maxN accumulator.
	| {
			$maxN: {
				input: Operator;
				n: Operator;
			};
	  }
	// Returns the n smallest values in an array. Distinct from the $minN accumulator.
	| {
			$minN: {
				input: Operator;
				n: Operator;
			};
	  }
	// Converts a document to an array of documents representing key-value pairs.
	| { $objectToArray: Operator }
	// Outputs an array containing a sequence of integers according to user-defined inputs.
	| { $range: [Operator, Operator] | [Operator, Operator, Operator] }
	// Applies an expression to each element in an array and combines them into a single value.
	| {
			$reduce: {
				input: Operator;
				initialValue: Operator;
				in: Operator;
			};
	  }
	// Returns an array with the elements in reverse order.
	| { $reverseArray: Operator }
	// Returns the number of elements in the array. Accepts a single expression as argument.
	| { $size: Operator }
	// Returns a subset of an array.
	| { $slice: [Operator, Operator] | [Operator, Operator, Operator] }
	// Sorts the elements of an array. Positional operators are supported. A field name like "values.1" refers to the item at index 1 in the values array. Currently unpredictable for non-number sorts.
	| {
			$sortArray: {
				input: Operator;
				sortBy: Operator;
			};
	  }
	// Merge two arrays together.
	| {
			$zip: {
				inputs: Operator[];
				useLongestLength?: Operator;
				defaults?: Operator;
			};
	  };

//// Boolean Expression Operators
/// Boolean expressions evaluate their argument expressions as booleans and return a boolean as the result.
// Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.
// $and
// Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.
// $not
// Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.
// $or

//// Comparison Expression Operators
/// Comparison expressions return a boolean except for $cmp which returns a number.
// Returns 0 if the two values are equivalent, 1 if the first value is greater than the second, and -1 if the first value is less than the second.
// $cmp
// Returns true if the values are equivalent.
// $eq
// Returns true if the first value is greater than the second.
// $gt
// Returns true if the first value is greater than or equal to the second.
// $gte
// Returns true if the first value is less than the second.
// $lt
// Returns true if the first value is less than or equal to the second.
// $lte
// Returns true if the values are not equivalent.
// $ne

//// Conditional Expression Operators
// A ternary operator that evaluates one expression, and depending on the result, returns the value of one of the other two expressions. Accepts either three expressions in an ordered list or three named parameters.
// $cond
// Returns either the non-null result of the first expression or the result of the second expression if the first expression results in a null result. Null result encompasses instances of undefined values or missing fields. Accepts two expressions as arguments. The result of the second expression can be null.
// $ifNull
// Evaluates a series of case expressions. When it finds an expression which evaluates to true, $switch executes a specified expression and breaks out of the control flow.
// $switch

//// Custom Aggregation Expression Operators
/// Defines a custom accumulator function.
// Defines a custom accumulator function.  New in version 4.4.
// $accumulator
// Defines a custom function.  New in version 4.4.
// $function

//// Data Size Operators
/// The following operators return the size of a data element:
// Returns the size of a given string or binary data value's content in bytes.
// $binarySize
// Returns the size in bytes of a given document (i.e. bsontype Object) when encoded as BSON.
// $bsonSize

//// Date Expression Operators
/// The following operators returns date objects or components of a date object:
// Adds a number of time units to a date object.
// $dateAdd
// Returns the difference between two dates.
// $dateDiff
// Constructs a BSON Date object given the date's constituent parts.
// $dateFromParts
// Converts a date/time string to a date object.
// $dateFromString
// Subtracts a number of time units from a date object.
// $dateSubtract
// Returns a document containing the constituent parts of a date.
// $dateToParts
// Returns the date as a formatted string.
// $dateToString
// Truncates a date.
// $dateTrunc
// Returns the day of the month for a date as a number between 1 and 31.
// $dayOfMonth
// Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday).
// $dayOfWeek
// Returns the day of the year for a date as a number between 1 and 366 (leap year).
// $dayOfYear
// Returns the hour for a date as a number between 0 and 23.
// $hour
// Returns the weekday number in ISO 8601 format, ranging from 1 (for Monday) to 7 (for Sunday).
// $isoDayOfWeek
// Returns the week number in ISO 8601 format, ranging from 1 to 53. Week numbers start at 1 with the week (Monday through Sunday) that contains the year's first Thursday.
// $isoWeek
// Returns the year number in ISO 8601 format. The year starts with the Monday of week 1 (ISO 8601) and ends with the Sunday of the last week (ISO 8601).
// $isoWeekYear
// Returns the milliseconds of a date as a number between 0 and 999.
// $millisecond
// Returns the minute for a date as a number between 0 and 59.
// $minute
// Returns the month for a date as a number between 1 (January) and 12 (December).
// $month
// Returns the seconds for a date as a number between 0 and 60 (leap seconds).
// $second
// Converts value to a Date.  New in version 4.0.
// $toDate
// Returns the week number for a date as a number between 0 (the partial week that precedes the first Sunday of the year) and 53 (leap year).
// $week
// Returns the year for a date as a number (e.g. 2014).
// $year
// Adds numbers and a date to return a new date. If adding numbers and a date, treats the numbers as milliseconds. Accepts any number of argument expressions, but at most, one expression can resolve to a date.
// $add
// Returns the result of subtracting the second value from the first. If the two values are dates, return the difference in milliseconds. If the two values are a date and a number in milliseconds, return the resulting date. Accepts two argument expressions. If the two values are a date and a number, specify the date argument first as it is not meaningful to subtract a date from a number.
// $subtract

//// Literal Expression Operator
// Return a value without parsing. Use for values that the aggregation pipeline may interpret as an expression. For example, use a $literal expression to a string that starts with a dollar sign ($) to avoid parsing as a field path.
// $literal

//// Miscellaneous Operators
/// Returns the value of a specified field from a document. You can use $getField to retrieve the value of fields with names that contain periods (.) or start with dollar signs ($).
// Returns the value of a specified field from a document. You can use $getField to retrieve the value of fields with names that contain periods (.) or start with dollar signs ($).  New in version 5.0.
// $getField
// Returns a random float between 0 and 1
// $rand
// Randomly select documents at a given rate. Although the exact number of documents selected varies on each run, the quantity chosen approximates the sample rate expressed as a percentage of the total number of documents.
// $sampleRate

//// Object Expression Operators
/// Adds, updates, or removes a specified field in a document. You can use $setField to add, update, or remove fields with names that contain periods (.) or start with dollar signs ($).
// Combines multiple documents into a single document.
// $mergeObjects
// Converts a document to an array of documents representing key-value pairs.
// $objectToArray
// Adds, updates, or removes a specified field in a document. You can use $setField to add, update, or remove fields with names that contain periods (.) or start with dollar signs ($).  New in version 5.0.
// $setField

//// Set Expression Operators
/// Set expressions performs set operation on arrays, treating arrays as sets. Set expressions ignores the duplicate entries in each input array and the order of the elements.
// Returns true if no element of a set evaluates to false, otherwise, returns false. Accepts a single argument expression.
// $allElementsTrue
// Returns true if any elements of a set evaluate to true; otherwise, returns false. Accepts a single argument expression.
// $anyElementTrue
// Returns a set with elements that appear in the first set but not in the second set; i.e. performs a relative complement of the second set relative to the first. Accepts exactly two argument expressions.
// $setDifference
// Returns true if the input sets have the same distinct elements. Accepts two or more argument expressions.
// $setEquals
// Returns a set with elements that appear in all of the input sets. Accepts any number of argument expressions.
// $setIntersection
// Returns true if all elements of the first set appear in the second set, including when the first set equals the second set; i.e. not a strict subset . Accepts exactly two argument expressions.
// $setIsSubset
// Returns a set with elements that appear in any of the input sets.
// $setUnion

//// String Expression Operators
/// String expressions, with the exception of $concat, only have a well-defined behavior for strings of ASCII characters.
// Concatenates any number of strings.
// $concat
// Converts a date/time string to a date object.
// $dateFromString
// Returns the date as a formatted string.
// $dateToString
// Searches a string for an occurrence of a substring and returns the UTF-8 byte index of the first occurrence. If the substring is not found, returns -1.
// $indexOfBytes
// Searches a string for an occurrence of a substring and returns the UTF-8 code point index of the first occurrence. If the substring is not found, returns -1
// $indexOfCP
// Removes whitespace or the specified characters from the beginning of a string.  New in version 4.0.
// $ltrim
// Applies a regular expression (regex) to a string and returns information on the first matched substring.  New in version 4.2.
// $regexFind
// Applies a regular expression (regex) to a string and returns information on the all matched substrings.  New in version 4.2.
// $regexFindAll
// Applies a regular expression (regex) to a string and returns a boolean that indicates if a match is found or not.  New in version 4.2.
// $regexMatch
// Replaces the first instance of a matched string in a given input.  New in version 4.4.
// $replaceOne
// Replaces all instances of a matched string in a given input.  New in version 4.4.
// $replaceAll
// Removes whitespace or the specified characters from the end of a string.  New in version 4.0.
// $rtrim
// Splits a string into substrings based on a delimiter. Returns an array of substrings. If the delimiter is not found within the string, returns an array containing the original string.
// $split
// Returns the number of UTF-8 encoded bytes in a string.
// $strLenBytes
// Returns the number of UTF-8 code points in a string.
// $strLenCP
// Performs case-insensitive string comparison and returns: 0 if two strings are equivalent, 1 if the first string is greater than the second, and -1 if the first string is less than the second.
// $strcasecmp
// Deprecated. Use $substrBytes or $substrCP.
// $substr
// Returns the substring of a string. Starts with the character at the specified UTF-8 byte index (zero-based) in the string and continues for the specified number of bytes.
// $substrBytes
// Returns the substring of a string. Starts with the character at the specified UTF-8 code point (CP) index (zero-based) in the string and continues for the number of code points specified.
// $substrCP
// Converts a string to lowercase. Accepts a single argument expression.
// $toLower
// Converts value to a string.  New in version 4.0.
// $toString
// Removes whitespace or the specified characters from the beginning and end of a string.  New in version 4.0.
// $trim
// Converts a string to uppercase. Accepts a single argument expression.
// $toUpper

//// Text Expression Operator
// Access available per-document metadata related to the aggregation operation.
// $meta

//// Timestamp Expression Operators
/// Timestamp expression operators return values from a timestamp.
// Returns the incrementing ordinal from a timestamp as a long.  New in version 5.1.
// $tsIncrement
// Returns the seconds from a timestamp as a long.  New in version 5.1.
// $tsSecond

//// Trigonometry Expression Operators
/// Trigonometry expressions perform trigonometric operations on numbers. Values that represent angles are always input or output in radians. Use $degreesToRadians and $radiansToDegrees to convert between degree and radian measurements.
// Returns the sine of a value that is measured in radians.
// $sin
// Returns the cosine of a value that is measured in radians.
// $cos
// Returns the tangent of a value that is measured in radians.
// $tan
// Returns the inverse sin (arc sine) of a value in radians.
// $asin
// Returns the inverse cosine (arc cosine) of a value in radians.
// $acos
// Returns the inverse tangent (arc tangent) of a value in radians.
// $atan
// Returns the inverse tangent (arc tangent) of y / x in radians, where y and x are the first and second values passed to the expression respectively.
// $atan2
// Returns the inverse hyperbolic sine (hyperbolic arc sine) of a value in radians.
// $asinh
// Returns the inverse hyperbolic cosine (hyperbolic arc cosine) of a value in radians.
// $acosh
// Returns the inverse hyperbolic tangent (hyperbolic arc tangent) of a value in radians.
// $atanh
// Returns the hyperbolic sine of a value that is measured in radians.
// $sinh
// Returns the hyperbolic cosine of a value that is measured in radians.
// $cosh
// Returns the hyperbolic tangent of a value that is measured in radians.
// $tanh
// Converts a value from degrees to radians.
// $degreesToRadians
// Converts a value from radians to degrees.
// $radiansToDegrees

//// Type Expression Operators
/// Converts a value to a specified type.
// Converts a value to a specified type.  New in version 4.0.
// $convert
// Returns boolean true if the specified expression resolves to an integer, decimal, double, or long.  Returns boolean false if the expression resolves to any other BSON type, null, or a missing field.  New in version 4.4.
// $isNumber
// Converts value to a boolean.  New in version 4.0.
// $toBool
// Converts value to a Date.  New in version 4.0.
// $toDate
// Converts value to a Decimal128.  New in version 4.0.
// $toDecimal
// Converts value to a double.  New in version 4.0.
// $toDouble
// Converts value to an integer.  New in version 4.0.
// $toInt
// Converts value to a long.  New in version 4.0.
// $toLong
// Converts value to an ObjectId.  New in version 4.0.
// $toObjectId
// Converts value to a string.  New in version 4.0.
// $toString
// Return the BSON data type of the field.
// $type

//// Accumulators ($group, $bucket, $bucketAuto, $setWindowFields)
/// Aggregation accumulator operators:
// Returns the result of a user-defined accumulator function.
// $accumulator
// Returns an array of unique expression values for each group. Order of the array elements is undefined.  Changed in version 5.0: Available in $setWindowFields stage.
// $addToSet
// Returns an average of numerical values. Ignores non-numeric values.  Changed in version 5.0: Available in $setWindowFields stage.
// $avg
// Returns the bottom element within a group according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $bottom
// Returns an aggregation of the bottom n fields within a group, according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $bottomN
// Returns the number of documents in a group.  Distinct from the $count pipeline stage.  New in version 5.0: Available in $group and $setWindowFields stages.
// $count
// Returns a value from the first document for each group. Order is only defined if the documents are sorted.  Distinct from the $first array operator.  Changed in version 5.0: Available in $setWindowFields stage.
// $first
// Returns an aggregation of the first n elements within a group. Only meaningful when documents are in a defined order. Distinct from the $firstN array operator.  New in version 5.2: Available in $group, expression and $setWindowFields stages.
// $firstN
// Returns a value from the last document for each group. Order is only defined if the documents are sorted.  Distinct from the $last array operator.  Changed in version 5.0: Available in $setWindowFields stage.
// $last
// Returns an aggregation of the last n elements within a group. Only meaningful when documents are in a defined order. Distinct from the $lastN array operator.  New in version 5.2: Available in $group, expression and $setWindowFields stages.
// $lastN
// Returns the highest expression value for each group.  Changed in version 5.0: Available in $setWindowFields stage.
// $max
// Returns an aggregation of the n maximum valued elements in a group. Distinct from the $maxN array operator.  New in version 5.2.  Available in $group, $setWindowFields and as an expression.
// $maxN
// Returns a document created by combining the input documents for each group.
// $mergeObjects
// Returns the lowest expression value for each group.  Changed in version 5.0: Available in $setWindowFields stage.
// $min
// Returns an array of expression values for documents in each group.  Changed in version 5.0: Available in $setWindowFields stage.
// $push
// Returns the population standard deviation of the input values.  Changed in version 5.0: Available in $setWindowFields stage.
// $stdDevPop
// Returns the sample standard deviation of the input values.  Changed in version 5.0: Available in $setWindowFields stage.
// $stdDevSamp
// Returns a sum of numerical values. Ignores non-numeric values.  Changed in version 5.0: Available in $setWindowFields stage.
// $sum
// Returns the top element within a group according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $top
// Returns an aggregation of the top n fields within a group, according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $topN

//// Accumulators (in Other Stages)
/// Some operators that are available as accumulators for the $group stage are also available for use in other stages but not as accumulators. When used in these other stages, these operators do not maintain their state and can take as input either a single argument or multiple arguments. For details, refer to the specific operator page.
// Returns an average of the specified expression or list of expressions for each document. Ignores non-numeric values.
// $avg
// Returns the maximum of the specified expression or list of expressions for each document
// $max
// Returns the minimum of the specified expression or list of expressions for each document
// $min
// Returns the population standard deviation of the input values.
// $stdDevPop
// Returns the sample standard deviation of the input values.
// $stdDevSamp
// Returns a sum of numerical values. Ignores non-numeric values.
// $sum

//// Variable Expression Operators
/// Defines variables for use within the scope of a subexpression and returns the result of the subexpression. Accepts named parameters.
// Defines variables for use within the scope of a subexpression and returns the result of the subexpression. Accepts named parameters.  Accepts any number of argument expressions.
// $let

//// Window Operators
/// New in version 5.0.
// Returns an array of all unique values that results from applying an expression to each document.  Changed in version 5.0: Available in $setWindowFields stage.
// $addToSet
// Returns the average for the specified expression. Ignores non-numeric values.  Changed in version 5.0: Available in $setWindowFields stage.
// $avg
// Returns the bottom element within a group according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $bottom
// Returns an aggregation of the bottom n fields within a group, according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $bottomN
// Returns the number of documents in the group or window.  Distinct from the $count pipeline stage.  New in version 5.0.
// $count
// Returns the population covariance of two numeric expressions.  New in version 5.0.
// $covariancePop
// Returns the sample covariance of two numeric expressions.  New in version 5.0.
// $covarianceSamp
// Returns the document position (known as the rank) relative to other documents in the $setWindowFields stage partition. There are no gaps in the ranks. Ties receive the same rank.  New in version 5.0.
// $denseRank
// Returns the average rate of change within the specified window.  New in version 5.0.
// $derivative
// Returns the position of a document (known as the document number) in the $setWindowFields stage partition. Ties result in different adjacent document numbers.  New in version 5.0.
// $documentNumber
// Returns the exponential moving average for the numeric expression.  New in version 5.0.
// $expMovingAvg
// Returns the value that results from applying an expression to the first document in a group or window.  Changed in version 5.0: Available in $setWindowFields stage.
// $first
// Returns the approximation of the area under a curve.  New in version 5.0.
// $integral
// Returns the value that results from applying an expression to the last document in a group or window.  Changed in version 5.0: Available in $setWindowFields stage.
// $last
// Fills null and missing fields in a window using linear interpolation based on surrounding field values.  Available in $setWindowFields stage.  New in version 5.3.
// $linearFill
// Last observation carried forward. Sets values for null and missing fields in a window to the last non-null value for the field.  Available in $setWindowFields stage.  New in version 5.2.
// $locf
// Returns the maximum value that results from applying an expression to each document.  Changed in version 5.0: Available in $setWindowFields stage.
// $max
// Returns the minimum value that results from applying an expression to each document.  Changed in version 5.0: Available in $setWindowFields stage.
// $min
// Returns an aggregation of the n minimum valued elements in a group. Distinct from the $minN array operator.  New in version 5.2.  Available in $group, $setWindowFields and as an expression.
// $minN
// Returns an array of values that result from applying an expression to each document.  Changed in version 5.0: Available in $setWindowFields stage.
// $push
// Returns the document position (known as the rank) relative to other documents in the $setWindowFields stage partition.  New in version 5.0.
// $rank
// Returns the value from an expression applied to a document in a specified position relative to the current document in the $setWindowFields stage partition.  New in version 5.0.
// $shift
// Returns the population standard deviation that results from applying a numeric expression to each document.  Changed in version 5.0: Available in $setWindowFields stage.
// $stdDevPop
// Returns the sample standard deviation that results from applying a numeric expression to each document.  Changed in version 5.0: Available in $setWindowFields stage.
// $stdDevSamp
// Returns the sum that results from applying a numeric expression to each document.  Changed in version 5.0: Available in $setWindowFields stage.
// $sum
// Returns the top element within a group according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $top
// Returns an aggregation of the top n fields within a group, according to the specified sort order.  New in version 5.2.  Available in $group and $setWindowFields stages.
// $topN
