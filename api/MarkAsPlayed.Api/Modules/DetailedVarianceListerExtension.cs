using Newtonsoft.Json.Linq;
using System.Reflection;

namespace MarkAsPlayed.Api.Modules
{
    static class DetailedVarianceListerExtension
    {
        /// <summary>
        ///     Creates a variance list from comparison
        /// </summary>
        public static List<Variance> DetailedComparer<T>(this T value1, T value2)
        {
            List<Variance> variances = new List<Variance>();

            try
            {
                MemberInfo[] memberInfo = value1!.GetType().GetMembers();
                foreach (MemberInfo m in memberInfo.Where(m => m is PropertyInfo))
                {
                    Variance v = new Variance();
                    v.Prop = ((PropertyInfo)m).Name;

                    if (IsNumberSequence(((PropertyInfo)m).PropertyType))
                    {
                        var oldValue = (IReadOnlyList<int>)((PropertyInfo)m).GetValue(value1)!;
                        var newValue = (IReadOnlyList<int>)((PropertyInfo)m).GetValue(value2)!;

                        if (oldValue is null) oldValue = new List<int>();
                        if (newValue is null) newValue = new List<int>();

                        if (oldValue.SequenceEqual(newValue)) continue;
                    }

                    v.oldValue = ((PropertyInfo)m).GetValue(value1);
                    v.newValue = ((PropertyInfo)m).GetValue(value2);

                    if (!Equals(v.oldValue, v.newValue))
                    {
                        if (IsString(((PropertyInfo)m).PropertyType))
                        {
                            v.oldValue = TrimString(v.oldValue);
                            v.newValue = TrimString(v.newValue);
                        }

                        variances.Add(v);
                    }
                }
            }
            catch (Exception)
            {
                return new List<Variance>();
            }
            
            return variances;
        }

        /// <summary>
        ///     Creates a variance list from single object
        /// </summary>
        public static List<Variance> DetailedComparer<T>(this T value1)
        {
            var variances = new List<Variance>();

            try
            {
                MemberInfo[] memberInfo = value1!.GetType().GetMembers();
                foreach (MemberInfo m in memberInfo.Where(m => m is PropertyInfo))
                {
                    Variance v = new Variance();
                    v.Prop = ((PropertyInfo)m).Name;
                    v.oldValue = String.Empty;
                    v.newValue = ((PropertyInfo)m).GetValue(value1);

                    if (IsString(((PropertyInfo)m).PropertyType))
                        v.newValue = TrimString(v.newValue);

                    variances.Add(v);
                }
            }
            catch (Exception)
            {
                return new List<Variance>();
            }

            return variances;
        }

        private static bool IsNumberSequence(Type type)
        {
            if (typeof(IReadOnlyList<int>).IsAssignableFrom(type) && !IsString(type))
            {
                return true;
            }
            return false;
        }

        private static bool IsString(Type type)
        {
            if (type.Name == nameof(String))
            {
                return true;
            }
            return false;
        }

        private static string? TrimString(object? value)
        {
            if (value is null) return null;

            if (value.ToString()!.Length > 50)
                return value.ToString()!.Substring(0, 49) + "...";
            else
                return value.ToString();
        }
    }
}

public class Variance
{
    public string? Prop { get; set; }
    public object? oldValue { get; set; }
    public object? newValue { get; set; }
}
