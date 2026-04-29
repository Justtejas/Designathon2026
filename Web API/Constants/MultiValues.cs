using System;

namespace Hexa_Hub.Models;
public class MultiValues
{
    public enum AssetStatus
    {
        OpenToRequest=0,
        Allocated=1,
        UnderMaintenance=2
    }

    public enum UserType
    {
        Employee=0,
        Admin=1
    }

    public enum RequestStatus
    {
        Pending=0,
        Allocated=1,
        Rejected=2
    }

    public enum IssueType
    {
        Malfunction=1,
        Repair=2,
        Installation=3
    }

    public enum AuditStatus
    {
        Sent=0,
        InProgress =1,
        Completed=2
    }

    public enum ServiceReqStatus
    {
        UnderReview=0,
        Approved=1,
        Completed=2,
        Rejected =3
    }

    public enum ReturnReqStatus
    {
        Sent=0,
        Approved=1,
        Returned=2,
        Rejected=3
    }

}
